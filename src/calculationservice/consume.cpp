#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <amqpcpp.h>

#include "conn_handler.h"
#include "onesdk/onesdk.h"


std::string getDtTraceSpanString(){
    char trace_id[ONESDK_TRACE_ID_BUFFER_SIZE];
    char span_id[ONESDK_SPAN_ID_BUFFER_SIZE];

    onesdk_tracecontext_get_current(trace_id, sizeof(trace_id), span_id, sizeof(span_id));
    std::ostringstream oss;
    oss << "[!dt dt.trace_id=" << trace_id << ",dt.span_id=" << span_id << "]";
    return oss.str();
}

/*
Validate that string only has the characters we expect,
as some of the messages received from rabbit were malformed,
lines were cut short and contained unprintable chars (ASCII 32)
*/
bool validateString(const std::string& str){
    for (char c : str) {
        if (!std::isalnum(c) && c != '-' && c != ':' && c != '.' && c != ',') {
            return false;
        }
    }
    return true;
}

void receiveMessage(std::string message){
    // Dynatrace SDK
    /* create tracer */
    onesdk_tracer_handle_t const tracer = onesdk_customservicetracer_create(
        onesdk_asciistr("ComputeFunctionReturns"),
        onesdk_asciistr("PriceAnalysisComputation")
    );

    /* start tracer */
    onesdk_tracer_start(tracer);
    // get trace_id and span_id string
    std::string dtTraceSpanId = getDtTraceSpanString();

    std::string line, part;
    std::istringstream messageStream(message);

    long int parsedLines = 0;
    long int discardedLines = 0;
    long double accumulator = 0.0;

    // drop header line
    std::getline(messageStream, line);

    while(std::getline(messageStream, line)){
        parsedLines++;
        // check the line is valid
        if(!validateString(line)){
            discardedLines++;
            std::cout << dtTraceSpanId << " " << "Unexpected chars detected, discarding the line [" << line << "]" << std::endl;
            continue;
        }

        std::istringstream lineStream(line);
        std::getline(lineStream, part, ','); // skip the date
        std::getline(lineStream, part, ','); // skip the open val
        std::getline(lineStream, part, ','); // skip the high val
        std::getline(lineStream, part, ','); // skip the low val
        std::getline(lineStream, part, ','); // get the close val

        try {
            accumulator += std::stod(part);
        } catch (const std::invalid_argument& e) {
            discardedLines++;
            std::cout << dtTraceSpanId << " " << "Couldn't parse the closing price, discarding the line [" << line << "]" << std::endl;
            continue;
        }
    }
    double average = parsedLines - discardedLines > 0 ? accumulator / (parsedLines - discardedLines) : 0.0;

    std::cout << dtTraceSpanId << " " << "Received message: lines parsed [" << parsedLines << "], lines discarded [" << discardedLines << "], average closing price [" << average << "]" << std::endl;

    /* end and release tracer */
    onesdk_tracer_end(tracer);

    return;
}

void consume(std::string address, std::string queue){
    ConnHandler handler;
    AMQP::TcpConnection connection(handler, AMQP::Address(address));
    AMQP::TcpChannel channel(&connection);

    channel.onError(
        [&handler](const char *message){
            std::cout << "Channel error: " << message << std::endl;
            handler.Stop();
        }
    );

    channel.consume(queue)
        .onReceived(
            [&channel](const AMQP::Message &msg, uint64_t tag, bool redelivered){
                channel.ack(tag);
                receiveMessage(msg.body());
            }
        )
        .onError(
            [](const char *message){
                std::cout << "consume operation failed" << std::endl;
            }
        );

    handler.Start();

    std::cout << "Closing connection." << std::endl;

    connection.close();

    return;
}

std::string getEnvVariable(const char *env_var){
    char *env_p = getenv(env_var);
    if (env_p == NULL){
        std::cout << "Env var [" << env_var << "] not found" << std::endl;
        return "";
    }
    return env_p;
}

int main(int argc, char **argv)
{
    std::string user = getEnvVariable("RABBITMQ_USER");
    std::string password = getEnvVariable("RABBITMQ_PASSWORD");
    std::string host = getEnvVariable("RABBITMQ_HOST");
    std::string port = getEnvVariable("RABBITMQ_PORT");
    std::string queue = getEnvVariable("RABBITMQ_QUEUE");

    if (user == "" || password == "" || host == "" || port == "" || queue == ""){
        return EXIT_FAILURE;
    }
    std::string address = "amqp://" + user + ":" + password + "@" + host + ":" + port;

    /* Initialize SDK */
    onesdk_result_t const onesdk_init_result = onesdk_initialize();

    consume(address, queue);

    if (onesdk_init_result == ONESDK_SUCCESS){
        onesdk_shutdown();
    }

    return 0;
}

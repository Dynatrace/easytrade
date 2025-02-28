package com.dynatrace.easytrade.accountservice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
public class Account {
    private Integer id;
    private Integer packageId;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String hashedPassword;
    private String origin;
    private Date creationDate;
    private Date packageActivationDate;
    private boolean accountActive;
    private String address;

    public ShortAccount toShortAccount() {
        return new ShortAccount(id, username, firstName, lastName);
    }

    public Boolean isPreset() {
        return origin.equals("PRESET");
    }
}

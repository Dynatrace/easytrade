import { PresetUser, UserResponse } from "../backend/users"

type MockUser = { password: string } & UserResponse

export const USERS: MockUser[] = [
    {
        id: 6,
        packageId: 3,
        firstName: "James",
        lastName: "Norton",
        username: "james_norton",
        email: "james.norton@yahoo.com",
        password: "pass_james_123",
        hashedPassword:
            "65593378630b74fd4d77eb54473a6a389e8eb23a7b67faefd798835543aa3967",
        origin: "PRESET",
        creationDate: "2022-01-08 15:01:21",
        packageActivationDate: "2022-01-08 15:01:21",
        accountActive: true,
        address: "test address 123",
    },
    {
        id: 7,
        packageId: 1,
        firstName: "Jessica",
        lastName: "Smith",
        username: "jessica_smith",
        email: "jessica.smith@gmail.com",
        password: "pass_jessica_123",
        hashedPassword:
            "3488b51313c45f71c34ccabbc40b42e700f7977e1acd6fb8dd5d9c96c808f66f",
        origin: "PRESET",
        creationDate: "2021-12-30 08:54:00",
        packageActivationDate: "2021-12-30 08:54:00",
        accountActive: true,
        address: "test address 123",
    },
    {
        id: 8,
        packageId: 3,
        firstName: "Tracy",
        lastName: "Wright",
        username: "tracy_wright",
        email: "tracy.wright@gmail.com",
        password: "pass_tracy_123",
        hashedPassword:
            "4f359e89e46e0988e4abf0b248074c815b682d5417bced6e88f955f12313859f",
        origin: "PRESET",
        creationDate: "2022-01-10 04:20:11",
        packageActivationDate: "2022-01-10 04:20:11",
        accountActive: true,
        address: "test address 123",
    },
]

export const PRESET_USERS: PresetUser[] = USERS.map(
    ({ id, username, firstName, lastName }) => ({
        id: id,
        username: username,
        firstName: firstName,
        lastName: lastName,
    })
)

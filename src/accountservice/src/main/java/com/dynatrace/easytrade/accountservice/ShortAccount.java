package com.dynatrace.easytrade.accountservice;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShortAccount {
    private Integer id;
    private String username;
    private String firstName;
    private String lastName;
}

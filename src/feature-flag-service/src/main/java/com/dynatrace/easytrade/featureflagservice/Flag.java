package com.dynatrace.easytrade.featureflagservice;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class Flag {
	private String id;
	private Boolean enabled;
	private String name;
	private String description;
	private Boolean isModifiable;
	private String tag;

	public void setEnabled(Boolean enabled) throws NonModifiableFlagException {
		if (Boolean.FALSE.equals(isModifiable)) {
			throw new NonModifiableFlagException("Can't update a non-modifiable flag [" + name + "]");
		}
		this.enabled = enabled;
	}
}

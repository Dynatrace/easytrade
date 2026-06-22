package com.dynatrace.easytrade.featureflagservice;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class Flag {
	private final String id;
	private boolean enabled;
	private final String name;
	private final String description;
	private final boolean isModifiable;
	private final String tag;

	public void setEnabled(boolean enabled) throws NonModifiableFlagException {
		if (!isModifiable) {
			throw new NonModifiableFlagException("Can't update a non-modifiable flag [" + name + "]");
		}
		this.enabled = enabled;
	}
}

package com.dynatrace.easytrade.featureflagservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FlagService {
    private final Map<String, Flag> flagRegistry;
    private static final Logger logger = LoggerFactory.getLogger(FlagService.class);

    @Autowired
    public FlagService(Map<String, Flag> flagRegistry) {
        this.flagRegistry = flagRegistry;
        logger.info("Creating [FlagService] instance with flags [" + flagRegistry.toString() + "]");
    }

    public Optional<Flag> getFlagById(String flagId) {
        return Optional.ofNullable(flagRegistry.get(flagId));
    }

    public Optional<Flag> updateFlag(String flagId, Boolean enabled) throws NonModifiableFlagException {
        Optional<Flag> flag = Optional.ofNullable(flagRegistry.get(flagId));
        if (flag.isPresent()) {
            flag.get().setEnabled(enabled);
        }
        return flag;
    }

    public List<Flag> getFlagsByTag(String tag) {
        return flagRegistry.values().stream().filter(flag -> tag.equals(flag.getTag())).toList();
    }

    public List<Flag> getAllFlags() {
        return flagRegistry.values().stream().toList();
    }

}

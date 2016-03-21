# Change Log

## node-oracledb v0.5.2 (20 Mar 2016)

- Synced with oracledb 1.7.1

## node-oracledb v0.5.1 (07 Nov 2015)

- Fixed issue with closing result set after getRows error

## node-oracledb v0.5.0 (26 Oct 2015)

- Refactored getting rows from the result set

## node-oracledb v0.1.10 (22 Oct 2015)

- Revert back to using WLError

## node-oracledb v0.1.9 (17 Oct 2015)

- Synced oracledb to version 1.3.0
- Removed dependency on WLError, Fixes #6
- Use log.silly except for unknown errors, Fixes #5
- Use the registerConnection callback properly, Fixes #7

## node-oracledb v0.1.8 (4 Oct 2015)

- updated oracledb dependency to 1.2.0
- set error status to 500. If a customExceptions is found set error status to 400
- processOracleError now looks up message from custom exceptions

## node-oracledb v0.1.7 (5 Sep 2015)

- Refactored code, added _processOptions, _processValues and _processCursor

## node-oracledb v0.1.6 (4 Sep 2015)

- Added CHANGELOG
- updated package keywords
- Changed log level from verbose to silly
- improved how options are processed in find:
- improved how where values are processed in find:
- removed unneeded documentation

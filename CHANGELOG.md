# Change Log

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

    function updateOracleValues() external {
        uint8 currentHour = uint8(
            (block.timestamp / (1 hours)) % UPDATE_TIME_IN_HOUR
        );
        if (block.timestamp / (1 hours) > lastTimestamp / (1 hours)) {
            _updatesSinceHourStart = 0;
            uint8 hourCount = (currentHour > previousHour)
                ? currentHour - previousHour
                : UPDATE_TIME_IN_HOUR + currentHour - previousHour;
            uint256 carriedPrice = movingPrice[previousHour];

            for (uint8 i = 1; i < hourCount; i++) {
                movingPrice[
                    (previousHour + i) % UPDATE_TIME_IN_HOUR
                ] = carriedPrice;
            }
        }

        uint256 latestAveragePrice = (movingPrice[currentHour] *
            _updatesSinceHourStart +
            oracle.readData()) / (_updatesSinceHourStart + 1);
        _updatesSinceHourStart++;

        movingPrice[currentHour] = latestAveragePrice;

        if (_shouldUpdateMinMax(_minPriceIndex, currentHour)) {
            _updateMinPrice();
        } else if (latestAveragePrice < _minPrice) {
            _minPrice = latestAveragePrice;
            _minPriceIndex = currentHour;
        }

        if (_shouldUpdateMinMax(_maxPriceIndex, currentHour)) {
            _updateMaxPrice();
        } else if (latestAveragePrice > _maxPrice) {
            _maxPrice = latestAveragePrice;
            _maxPriceIndex = currentHour;
        }

        previousHour = currentHour;
        lastTimestamp = block.timestamp;
    }

    function _shouldUpdateMinMax(uint8 index, uint8 currentHour)
        internal
        view
        returns (bool)
    {
        if (previousHour <= currentHour) {
            return previousHour <= index && index <= currentHour;
        } else {
            return previousHour <= index || index <= currentHour;
        }
    }

    function _updateMinPrice() internal {
        uint256 min = type(uint256).max;

        for (uint8 i = 0; i < UPDATE_TIME_IN_HOUR; i++) {
            uint256 price = movingPrice[i];
            if (price < min) {
                _minPriceIndex = i;
                min = price;
            }
        }
        _minPrice = min;
    }

    function _updateMaxPrice() internal {
        uint256 max = 0;

        for (uint8 i = 0; i < UPDATE_TIME_IN_HOUR; i++) {
            uint256 price = movingPrice[i];
            if (price > max) {
                _maxPriceIndex = i;
                max = price;
            }
        }
        _maxPrice = max;
    }

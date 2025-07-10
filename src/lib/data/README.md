# Data Directory (src/lib/data)

## company_tickers.json

This file contains the ticker-to-CIK mapping for all available companies.

**Important**: This file is committed to the repository and shipped with deployments. 
It should be updated manually when needed and committed to version control.

**Location**: `src/lib/data/company_tickers.json` (not in .gitignore)

### Format:
```json
{
  "TICKER": {
    "cik": "0001234567", // 10-digit CIK with leading zeros
    "title": "Company Name"
  }
}
```

### Updating:
1. Edit this file directly in the codebase
2. Deploy the changes
3. The ticker list will be available immediately

### Source:
Original data sourced from SEC company_tickers.json API:
https://www.sec.gov/files/company_tickers.json

### Notes:
- Admin panel and auto-update routes have been removed for security
- Manual updates ensure control over which tickers are available
- CIK format is standardized to 10 digits with leading zeros

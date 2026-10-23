#!/bin/bash
set -e

run_sql() {
  /opt/mssql-tools18/bin/sqlcmd -C -S db -U sa -P "$SA_PASSWORD" "$@"
}

echo "Checking whether the login database already has its tables..."

HAS_TABLES=$(run_sql -h -1 -W -Q "SET NOCOUNT ON; SELECT CASE WHEN DB_ID('DB_CEIH') IS NOT NULL AND OBJECT_ID('DB_CEIH.dbo.Users') IS NOT NULL THEN 1 ELSE 0 END" | tr -d '[:space:]')

if [ "$HAS_TABLES" = "1" ]; then
  echo "Login database is already set up. Nothing to do."
  exit 0
fi

echo "Creating the login database from schema.sql..."
run_sql -b -i /setup/schema.sql
echo "Login database created."
#!/bin/bash

# Directory containing the files to commit
PROJECT_DIR="$(pwd)"

# Start date
YEAR=2025
MONTH=01
DAY=21

# Counter for commits
COMMIT_COUNT=0

# Name of this script to exclude
SCRIPT_NAME=$(basename "$0")

# Get a list of untracked files (excluding ignored files)
UNTRACKED_FILES=$(git ls-files --others --exclude-standard)

# Check if there are any untracked files
if [ -z "$UNTRACKED_FILES" ]; then
    echo "No untracked files found to commit."
    exit 0
fi

# Loop through each untracked file
echo "$UNTRACKED_FILES" | while read -r file; do
    # Skip this script
    if [ "$(basename "$file")" = "$SCRIPT_NAME" ]; then
        echo "Skipping this script: $file"
        continue
    fi
    
    # Add the file
    git add "$file"
    
    # Set the commit date
    COMMIT_DATE="$YEAR-$MONTH-$DAY 00:00:00"
    
    # Commit with the specified date
    GIT_AUTHOR_DATE="$COMMIT_DATE" GIT_COMMITTER_DATE="$COMMIT_DATE" git commit -m "File added: $(basename "$file")"
    
    echo "Committed file: $file with date: $COMMIT_DATE"
    
    # Increment commit count
    COMMIT_COUNT=$((COMMIT_COUNT + 1))
    
    # Check if we've done 15 commits
    if [ $((COMMIT_COUNT % 15)) -eq 0 ]; then
        # Move to the next day
        DAY=$((10#$DAY + 1))  # Force base-10 interpretation
        
        # Handle month rollover
        if [[ "$MONTH" == "01" && "$DAY" -gt 31 ]]; then
            MONTH="02"
            DAY=1
        elif [[ "$MONTH" == "02" && "$DAY" -gt 28 ]]; then
            MONTH="03"
            DAY=1
        elif [[ "$MONTH" == "03" && "$DAY" -gt 31 ]]; then
            MONTH="04"
            DAY=1
        elif [[ "$MONTH" == "04" && "$DAY" -gt 30 ]]; then
            MONTH="05"
            DAY=1
        elif [[ "$MONTH" == "05" && "$DAY" -gt 31 ]]; then
            MONTH="06"
            DAY=1
        elif [[ "$MONTH" == "06" && "$DAY" -gt 30 ]]; then
            MONTH="07"
            DAY=1
        elif [[ "$MONTH" == "07" && "$DAY" -gt 31 ]]; then
            MONTH="08"
            DAY=1
        elif [[ "$MONTH" == "08" && "$DAY" -gt 31 ]]; then
            MONTH="09"
            DAY=1
        elif [[ "$MONTH" == "09" && "$DAY" -gt 30 ]]; then
            MONTH="10"
            DAY=1
        elif [[ "$MONTH" == "10" && "$DAY" -gt 31 ]]; then
            MONTH="11"
            DAY=1
        elif [[ "$MONTH" == "11" && "$DAY" -gt 30 ]]; then
            MONTH="12"
            DAY=1
        elif [[ "$MONTH" == "12" && "$DAY" -gt 31 ]]; then
            YEAR=$((YEAR + 1))
            MONTH="01"
            DAY=1
        fi
        
        # Ensure proper formatting with leading zeros
        MONTH=$(printf "%02d" $MONTH)
        DAY=$(printf "%02d" $DAY)
        
        echo "Moving to next day: $YEAR-$MONTH-$DAY"
    fi
done

echo "All files have been committed!"
#!/bin/bash
set -e

echo "=============================="
echo " TruthLens End-to-End Tests"
echo "=============================="

BASE="http://0.0.0.0:8000/api"

echo ""
echo "➡️ 1. Creating API test user..."

RANDOM_NAME="testuser_$(uuidgen | tr 'A-Z' 'a-z' | cut -d'-' -f1)"
RANDOM_EMAIL="${RANDOM_NAME}@test.com"

USER_RESPONSE=$(curl -s -X POST $BASE/users/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$RANDOM_NAME\",\"email\":\"$RANDOM_EMAIL\",\"password\":\"123\"}")

echo "User response: $USER_RESPONSE"

USER_ID=$(echo $USER_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user_id'))")
echo "Created USER_ID=$USER_ID"

echo ""
echo "➡️ 2. Creating document..."

DOC_RESPONSE=$(curl -s -X POST $BASE/documents/create/ \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"TestDoc\",\"content\":\"Paris is in Germany. The moon is made of cheese.\",\"user_id\":$USER_ID}")

echo "Document response: $DOC_RESPONSE"

DOC_ID=$(echo $DOC_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('document_id'))")
echo "Created DOCUMENT_ID=$DOC_ID"

echo ""
echo "➡️ 3. Fetching initial sentences..."
curl -s $BASE/documents/$DOC_ID/sentences/
echo ""

echo ""
echo "➡️ 4. Running Ollama analysis..."
curl -s -X POST $BASE/documents/$DOC_ID/analyze/
echo ""

echo ""
echo "➡️ 5. Fetching sentences after analysis..."
curl -s $BASE/documents/$DOC_ID/sentences/
echo ""

echo ""
echo "➡️ 6. Fetching corrections per sentence..."

SENTENCE_IDS=$(curl -s $BASE/documents/$DOC_ID/sentences/ | \
  python3 -c "import sys,json; data=json.load(sys.stdin); print(' '.join(str(s['sentence_id']) for s in data))")

for SID in $SENTENCE_IDS; do
  echo "➡️ Corrections for sentence $SID:"
  curl -s $BASE/sentences/$SID/corrections/
  echo ""
done

echo ""
echo "=============================="
echo "      TESTS COMPLETE 🎉"
echo "=============================="

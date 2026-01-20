# Zusam API - Posting Collection

This directory contains a comprehensive collection of API requests for testing the Zusam API using [Posting](https://posting.sh), a modern API client that runs in your terminal.

## Prerequisites

1. **Install Posting**: Follow the installation instructions at [https://posting.sh](https://posting.sh)

2. **Start local Zusam instance**: Ensure you have a Zusam instance running at `http://localhost:8080`
   ```bash
   # From the zusam repository root
   dev/start-test-container
   ```

3. **Set up environment variables**:
   ```bash
   # From the dev/posting directory
   cp posting.env.example posting.env
   ```

   Then edit `posting.env` with your API key.
   **Important**: The `posting.env` file is git-ignored to prevent committing sensitive API keys to the repository.

## Usage

```bash
posting --env dev/posting/posting.env --collection dev/posting
```

**Important**: Posting loads `posting.env` from your **current working directory**, not from the collection directory. Make sure to either:
- Run from `dev/posting/`, or
- Use `--env dev/posting/posting.env` flag

Navigate through requests using the keyboard-centric interface:
- **Shift+J** / **Shift+K**: Navigate between sub-collections
- **Enter**: Execute selected request
- **Tab**: Cycle through panels

## Common Workflows

### 1. Initial Setup
1. **Login** (`auth/login`) - Get your API key
2. **Get API Info** (`auth/info`) - Check enabled features
3. **Get Current User** (`users/get-me`) - View your profile

### 2. Create Content
1. **Create Group** (`groups/create-group`)
2. **Upload File** (optional, `files/upload-file`)
3. **Create Message** (`messages/create-message`) - Use group ID and optional file ID
4. **Add Reaction** (`reactions/add-reaction`) - React to the message

### 3. Explore & Search
1. **Get Feed** (`messages/get-feed`) - See all messages from your groups
2. **Get Group Page** (`groups/get-page`) - Browse specific group
3. **Search Messages** (`messages/search`) - Find content by keywords

### 4. Organize
1. **Create Bookmark** (`bookmarks/create-bookmark`) - Save important messages
2. **Get Bookmarks** (`bookmarks/get-bookmarks`) - Access saved messages
3. **Get Notifications** (`notifications/get-notifications`) - Check activity

## Environment Variables

The collection uses environment variables to manage sensitive data and configuration:

### Available Variables

- `API_KEY`: Your Zusam API key (required for authenticated requests)
- `BASE_URL`: Base URL for the Zusam instance (default: `http://localhost:8080`)

### Configuration

Variables are defined in `posting.env`:

```bash
API_KEY="your-api-key-here"
BASE_URL="http://localhost:8080"
```

**Security Note**: Never commit `posting.env` to git! It's already in `.gitignore`. Use `posting.env.example` as a template for other developers.

### Getting Your API Key

To obtain an API key for testing:

1. Use the `auth/login` request with your credentials
2. Copy the `api_key` from the response
3. Update `posting.env` with the new key

Alternatively, for the default test instance, use:
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"login": "zusam", "password": "zusam"}'
```

## Request Placeholders

Many requests use placeholder IDs (all zeros UUID format):
- `00000000-0000-0000-0000-000000000000`

Replace these with actual IDs from your Zusam instance when testing. The easiest way:
1. Create resources using the `create-*` requests
2. Copy the returned IDs from responses
3. Use them in subsequent requests

You can also define frequently-used IDs as environment variables in `posting.env`:
```bash
API_KEY="your-api-key"
BASE_URL="http://localhost:8080"
MY_USER_ID="12345678-1234-1234-1234-123456789abc"
MY_GROUP_ID="87654321-4321-4321-4321-cba987654321"
```

Then reference them in requests using `$MY_USER_ID` or `${MY_GROUP_ID}`.

## Additional Resources

- **API Documentation**: Access the auto-generated API docs at `http://localhost:8080/api/doc` (when instance is running)
- **Posting Documentation**: [https://posting.sh/guide/](https://posting.sh/guide/)

## Notes

- All authenticated endpoints require the `X-AUTH-TOKEN` header
- Some features may be disabled in your instance configuration (check `/api/info`)
- File uploads use multipart form-data (see `files/upload-file`)
- Reactions require `allow.message.reactions` to be enabled
- Public links require `allow.public.links` to be enabled

## Troubleshooting

**403 Forbidden**: Check if you're a member of the group/owner of the resource

**401 Unauthorized**: Verify your API key is correct and still valid

**404 Not Found**: Ensure the resource ID exists (create it first if needed)

**502 Bad Gateway**: File directory may not be writable (for file uploads)

## Contributing

When adding new requests to this collection:
1. Use descriptive names and detailed descriptions
2. Include realistic placeholder values
3. Document expected responses and common errors in descriptions
4. Follow the existing YAML format

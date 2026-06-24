# Deploy Bridge to IONOS with FileZilla

Target domains:

- `https://nuviobridge.com`
- `https://www.nuviobridge.com`

This guide deploys the full Next.js application. It requires an IONOS VPS or
Cloud Server with SSH/root access. A basic shared FTP webspace cannot run the
Node.js server and Bridge API routes.

## 1. Create the IONOS server

In IONOS:

1. Create an Ubuntu 24.04 LTS VPS or Cloud Server.
2. Record its public IPv4 address.
3. Add an SSH key or record the temporary root password.
4. In the firewall policy, allow inbound TCP ports `22`, `80`, and `443`.

Recommended starting size: 2 vCPU and at least 4 GB RAM.

## 2. Point the domain to the server

In **IONOS → Domains & SSL → nuviobridge.com → DNS**:

1. Create or update the apex `A` record:
   - Host: `@`
   - Value: the server IPv4 address
2. Create or update the `www` record:
   - Type: `CNAME`
   - Host: `www`
   - Value: `nuviobridge.com`
3. Remove conflicting `A`, `AAAA`, or `CNAME` records for `@` and `www`.
4. Wait for DNS propagation. It can be quick, but allow up to 24–48 hours.

Verify from a local terminal:

```bash
dig +short nuviobridge.com
dig +short www.nuviobridge.com
```

Both names must resolve to the IONOS server before requesting SSL.

## 3. Prepare Ubuntu

Open the IONOS browser console or connect with Terminal:

```bash
ssh root@YOUR_SERVER_IP
```

Install Node.js 22, Nginx, and Certbot:

```bash
apt update
apt install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
  > /etc/apt/sources.list.d/nodesource.list
apt update
apt install -y nodejs
node --version
mkdir -p /var/www/nuviobridge
chown -R www-data:www-data /var/www/nuviobridge
```

## 4. Build the FileZilla upload package

In Cursor’s terminal on the Mac:

```bash
cd /Users/fitdog/Desktop/bridge2.0/a
chmod +x deploy/ionos/build-upload.sh
./deploy/ionos/build-upload.sh
```

The upload folder will be:

```text
/Users/fitdog/Desktop/bridge2.0/a/deploy/ionos/upload/nuviobridge
```

## 5. Connect FileZilla

Use **FileZilla Client → File → Site Manager → New Site**:

- Protocol: `SFTP - SSH File Transfer Protocol`
- Host: the IONOS server IPv4 address
- Port: `22`
- Logon Type: `Key file` or `Normal`
- User: `root` for initial deployment
- Password/Key file: the credentials created in IONOS

Click **Connect**. Confirm the server fingerprint only after checking that it
matches the IONOS server.

## 6. Upload Bridge

In FileZilla:

1. Local site:
   `/Users/fitdog/Desktop/bridge2.0/a/deploy/ionos/upload/nuviobridge`
2. Remote site:
   `/var/www/nuviobridge`
3. Select everything inside the local `nuviobridge` folder.
4. Drag it into `/var/www/nuviobridge`.
5. Wait until **Queued files** and **Failed transfers** both show zero.

Do not upload the full `node_modules`, `.git`, `.next/cache`, local `.env`
files, screenshots, or the entire 1.8 GB development repository.

## 7. Add production secrets

In the IONOS SSH console:

```bash
cd /var/www/nuviobridge
cp .env.production.example .env.production
nano .env.production
```

Set the production URL and required API/Supabase values. Never send or paste
these secrets into chat. Save with `Control+O`, Enter, then `Control+X`.

Secure the file:

```bash
chown -R www-data:www-data /var/www/nuviobridge
chmod 600 /var/www/nuviobridge/.env.production
```

## 8. Install the system service

```bash
cp /var/www/nuviobridge/nuviobridge.service /etc/systemd/system/nuviobridge.service
systemctl daemon-reload
systemctl enable --now nuviobridge
systemctl status nuviobridge --no-pager
```

Test the private Node server:

```bash
curl -I http://127.0.0.1:3000
```

Expected result: an HTTP `200`, `307`, or another valid Bridge response—not a
connection error.

## 9. Configure Nginx

```bash
cp /var/www/nuviobridge/nuviobridge.nginx.conf /etc/nginx/sites-available/nuviobridge
ln -s /etc/nginx/sites-available/nuviobridge /etc/nginx/sites-enabled/nuviobridge
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Open:

```text
http://nuviobridge.com
http://www.nuviobridge.com
```

## 10. Enable free HTTPS

After DNS points to the server:

```bash
certbot --nginx -d nuviobridge.com -d www.nuviobridge.com
```

Choose the redirect-to-HTTPS option. Test renewal:

```bash
certbot renew --dry-run
```

## 11. Final production audit

Check:

- `https://nuviobridge.com`
- `https://www.nuviobridge.com`
- `/onboarding`
- `/login`
- `/pricing`
- all nine pathway selections
- parent login and dashboard
- therapist workspace
- routines, communication, reports, and library
- mobile layout

Server checks:

```bash
systemctl status nuviobridge --no-pager
journalctl -u nuviobridge -n 100 --no-pager
nginx -t
curl -I https://www.nuviobridge.com
```

## Updating Bridge later

1. Run `./deploy/ionos/build-upload.sh` again.
2. In FileZilla, upload the new package to `/var/www/nuviobridge`.
3. In SSH:

```bash
chown -R www-data:www-data /var/www/nuviobridge
systemctl restart nuviobridge
systemctl status nuviobridge --no-pager
```

Keep `.env.production` on the server. Do not replace it with the empty example.

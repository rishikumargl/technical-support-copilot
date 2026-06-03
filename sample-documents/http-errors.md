# HTTP Error Codes - Complete Reference

## 4xx Client Errors

### 400 Bad Request
**Definition**: The server cannot understand the request due to invalid syntax.

**Common Causes**:
- Invalid JSON in request body
- Missing required parameters
- Malformed URL
- Incorrect content-type header

**Solutions**:
```bash
# Check request format
curl -X POST http://api.example.com/endpoint \
  -H "Content-Type: application/json" \
  -d '{"valid":"json"}'

# Validate JSON
echo '{"test":"data"}' | jq .
```

### 401 Unauthorized
**Definition**: Authentication is required but missing or invalid.

**Common Causes**:
- Missing authentication token
- Expired token
- Invalid credentials
- Invalid API key

**Solutions**:
```bash
# Add authorization header
curl -H "Authorization: Bearer YOUR_TOKEN" http://api.example.com/endpoint

# Refresh token
curl -X POST http://api.example.com/auth/refresh \
  -H "Authorization: Bearer REFRESH_TOKEN"
```

### 403 Forbidden
**Definition**: The server understood the request but refuses to fulfill it.

**Common Causes**:
- Insufficient permissions
- Resource access denied
- IP address not whitelisted
- User role doesn't have access

**Solutions**:
- Check user permissions
- Verify role-based access control
- Request elevated privileges
- Check resource policies

### 404 Not Found
**Definition**: The requested resource could not be found.

**Common Causes**:
- Wrong endpoint URL
- Resource deleted
- Typo in path
- Version mismatch

**Solutions**:
```bash
# List available endpoints
curl http://api.example.com/

# Check if resource exists
curl -I http://api.example.com/resource/123
```

### 429 Too Many Requests
**Definition**: The user has sent too many requests in a short time period.

**Common Causes**:
- Rate limiting exceeded
- DDoS protection triggered
- Quota exceeded
- Too many concurrent connections

**Solutions**:
```bash
# Implement exponential backoff
# Add delay between requests
sleep 2

# Check rate limit headers
curl -i http://api.example.com/ | grep -i "rate-limit"
```

---

## 5xx Server Errors

### 500 Internal Server Error
**Definition**: The server encountered an unexpected condition.

**Common Causes**:
- Application crash
- Unhandled exception
- Database connection failure
- Resource exhaustion

**Diagnosis**:
```bash
# Check server logs
tail -f /var/log/application.log

# Monitor system resources
top
free -h
df -h

# Restart service
systemctl restart application
```

### 502 Bad Gateway
**Definition**: The server received an invalid response from an upstream server.

**Common Causes**:
- Upstream service is down
- Upstream service is slow (timeout)
- Misconfigured proxy
- Load balancer issues
- Database is unreachable

**Diagnosis**:
```bash
# Check upstream service status
curl -v http://upstream-service:8080/health

# Check proxy configuration
cat /etc/nginx/nginx.conf

# Test DNS resolution
nslookup upstream-service
dig upstream-service

# Monitor network connectivity
ping upstream-service
traceroute upstream-service
```

**Solutions**:

1. **Check Upstream Service**
   ```bash
   # Verify service is running
   systemctl status upstream-service
   
   # Check service logs
   journalctl -u upstream-service -n 50
   
   # Restart service
   systemctl restart upstream-service
   ```

2. **Verify Network Connectivity**
   ```bash
   # Test connection to upstream
   nc -zv upstream-service 8080
   
   # Check firewall rules
   iptables -L -n
   ```

3. **Check Proxy Configuration**
   ```nginx
   upstream backend {
     server upstream-service:8080;
     keepalive 64;
   }
   
   server {
     listen 80;
     location / {
       proxy_pass http://backend;
       proxy_connect_timeout 60s;
       proxy_send_timeout 60s;
       proxy_read_timeout 60s;
     }
   }
   ```

4. **Monitor Request Timeouts**
   - Increase timeout values in proxy configuration
   - Optimize upstream service performance
   - Add caching layer

### 503 Service Unavailable
**Definition**: The server is temporarily unable to handle the request.

**Common Causes**:
- Server maintenance
- Server overload
- All backend servers down
- Database maintenance

**Solutions**:
```bash
# Check if service is responding
curl http://api.example.com/health

# Monitor resource usage
watch -n 1 'free -h && echo "---" && df -h'

# Scale up if running Kubernetes
kubectl scale deployment api-server --replicas=3
```

### 504 Gateway Timeout
**Definition**: The gateway did not receive a response from the upstream server.

**Common Causes**:
- Upstream server is slow
- Network latency issues
- Connection timeout is too short
- Upstream database is slow

**Solutions**:
1. **Increase Timeout Values**
   ```nginx
   proxy_connect_timeout 30s;
   proxy_send_timeout 60s;
   proxy_read_timeout 60s;
   ```

2. **Optimize Upstream Service**
   - Profile slow database queries
   - Add caching layer
   - Scale horizontally

3. **Monitor Performance**
   ```bash
   # Check response times
   curl -w "@curl-format.txt" -o /dev/null -s http://api.example.com/
   
   # Monitor in production
   # Use APM tools like Datadog, New Relic
   ```

---

## Debugging HTTP Errors

### Using curl
```bash
# Verbose output with headers
curl -v http://api.example.com/endpoint

# Include response headers
curl -i http://api.example.com/endpoint

# Show timing information
curl -w "@curl-format.txt" -o /dev/null -s http://api.example.com/endpoint

# Follow redirects
curl -L http://api.example.com/endpoint
```

### Using wget
```bash
# Verbose output
wget -v http://api.example.com/endpoint

# Save headers
wget --save-headers http://api.example.com/endpoint

# Check only headers
wget --spider http://api.example.com/endpoint
```

### Monitoring with tcpdump
```bash
# Capture HTTP traffic
sudo tcpdump -i any -A 'tcp port 80 or tcp port 443' | grep -a 'HTTP/'

# Save to file
sudo tcpdump -i any -w capture.pcap 'tcp port 80'
```

---

## HTTP Error Recovery Best Practices

1. **Implement Retry Logic**
   ```javascript
   async function fetchWithRetry(url, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fetch(url);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(r => setTimeout(r, 2 ** i * 1000));
       }
     }
   }
   ```

2. **Add Circuit Breaker Pattern**
   - Track failures
   - Open circuit after threshold
   - Resume with exponential backoff

3. **Implement Fallbacks**
   - Use cached responses
   - Degrade functionality gracefully
   - Provide user feedback

4. **Monitor and Alert**
   - Track error rates
   - Set up alerts for threshold breaches
   - Log all errors for analysis

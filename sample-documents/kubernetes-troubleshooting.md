# Kubernetes Troubleshooting Guide

## CrashLoopBackOff Error

### What is CrashLoopBackOff?
CrashLoopBackOff is a Kubernetes status that indicates a pod is crashing repeatedly. The kubelet automatically attempts to restart the pod, but it fails each time, entering a crash loop.

### Common Causes

1. **Application Errors**: The container application itself is crashing
   - Missing dependencies
   - Invalid configuration
   - Runtime errors

2. **Resource Constraints**: The pod doesn't have enough resources
   - Insufficient memory
   - Insufficient CPU
   - Memory limits too low

3. **Health Check Failures**: Liveness probes fail
   - Application not responding
   - Health endpoint misconfigured
   - Network connectivity issues

### How to Troubleshoot

#### Step 1: Check Pod Status
```bash
kubectl get pods -n <namespace>
kubectl describe pod <pod-name> -n <namespace>
```

#### Step 2: Review Logs
```bash
# Get logs from current container
kubectl logs <pod-name> -n <namespace>

# Get logs from previous container instance
kubectl logs <pod-name> -n <namespace> --previous

# Follow logs in real-time
kubectl logs -f <pod-name> -n <namespace>
```

#### Step 3: Check Resource Availability
```bash
kubectl describe node <node-name>
kubectl top nodes
kubectl top pods -n <namespace>
```

#### Step 4: Verify Configuration
```bash
# Check deployment configuration
kubectl get deployment <deployment-name> -o yaml -n <namespace>

# Check environment variables
kubectl set env pod <pod-name> -n <namespace> --list
```

### Solutions

1. **Fix Application Code**
   - Review application logs for errors
   - Ensure all dependencies are installed
   - Verify configuration files

2. **Increase Resource Limits**
   ```yaml
   resources:
     limits:
       memory: "512Mi"
       cpu: "500m"
     requests:
       memory: "256Mi"
       cpu: "250m"
   ```

3. **Fix Health Checks**
   - Ensure liveness probe endpoint responds correctly
   - Increase initialDelaySeconds for slow-starting apps
   - Check probe timeout and failure threshold

4. **Update Image**
   ```bash
   kubectl set image deployment/<name> <container>=<new-image> -n <namespace>
   ```

---

## ImagePullBackOff Error

### What is ImagePullBackOff?
This error indicates that Kubernetes cannot pull the container image from the registry.

### Common Causes

1. **Image Not Found**: The image doesn't exist in the registry
2. **Authentication Failure**: Invalid credentials for private registry
3. **Network Issues**: Cannot reach the registry
4. **Incorrect Image Name**: Typo in image name or tag

### How to Troubleshoot

#### Check Image Existence
```bash
# For Docker Hub
docker pull <image-name>:<tag>

# For private registry
docker login <registry>
docker pull <registry>/<image-name>:<tag>
```

#### Verify Image Pull Secrets
```bash
# Create secret for private registry
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<username> \
  --docker-password=<password> \
  -n <namespace>

# Reference in pod spec
imagePullSecrets:
- name: regcred
```

#### Check Node Connectivity
```bash
# SSH into node
kubectl debug node/<node-name> -it --image=ubuntu

# Test registry connectivity
curl https://<registry>/v2/
```

### Solutions

1. **Correct Image Name**
   ```yaml
   image: registry.example.com/my-app:v1.0.0
   imagePullPolicy: IfNotPresent
   ```

2. **Add Image Pull Secrets**
   ```yaml
   imagePullSecrets:
   - name: regcred
   ```

3. **Use Correct Image Tag**
   - Ensure the tag exists in the registry
   - Use specific version tags, not "latest"

---

## Pod Pending State

### Causes and Solutions

1. **Insufficient Resources**
   ```bash
   # Check node capacity
   kubectl describe nodes
   
   # Reduce resource requests
   resources:
     requests:
       memory: "128Mi"
   ```

2. **Scheduling Issues**
   ```bash
   # Check for node affinity conflicts
   kubectl describe pod <pod-name>
   
   # Check for taints
   kubectl describe node <node-name>
   ```

3. **Persistent Volume Not Available**
   ```bash
   # Check PVC status
   kubectl get pvc -n <namespace>
   kubectl describe pvc <pvc-name> -n <namespace>
   ```

---

## Node Pressure - DiskPressure, MemoryPressure

### What It Means
The node has exceeded thresholds for disk or memory usage.

### Mitigation Strategies

1. **Free Up Disk Space**
   ```bash
   # On the node
   docker system prune
   kubectl debug node/<node-name> -it --image=ubuntu
   ```

2. **Evict Pods**
   ```bash
   # Kubernetes will evict pods based on QoS class
   # Force eviction if needed
   kubectl delete pod <pod-name> -n <namespace> --grace-period=0 --force
   ```

3. **Scale Down Workloads**
   ```bash
   kubectl scale deployment <name> --replicas=0 -n <namespace>
   ```

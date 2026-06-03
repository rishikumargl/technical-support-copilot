// Demo mode - works without OpenAI API key
import { hybridSearch } from './retrievalServiceSimple.js';
import storageDb from '../storage.js';
import crypto from 'crypto';

const { storage, saveData } = storageDb;

const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || 0.3);

// Predefined answers for common queries
const DEMO_ANSWERS = {
  'crashloopbackoff': {
    answer: `CrashLoopBackOff is a Kubernetes status that indicates a pod is crashing repeatedly. The kubelet automatically attempts to restart the pod, but it fails each time, entering a crash loop.

**Common Causes:**
1. **Application Errors** - The container application itself is crashing
   - Missing dependencies
   - Invalid configuration
   - Runtime errors

2. **Resource Constraints** - The pod doesn't have enough resources
   - Insufficient memory
   - Insufficient CPU
   - Memory limits too low

3. **Health Check Failures** - Liveness probes fail
   - Application not responding
   - Health endpoint misconfigured
   - Network connectivity issues

**How to Troubleshoot:**

Step 1: Check Pod Status
\`\`\`bash
kubectl get pods -n <namespace>
kubectl describe pod <pod-name> -n <namespace>
\`\`\`

Step 2: Review Logs
\`\`\`bash
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
\`\`\`

Step 3: Check Resource Availability
\`\`\`bash
kubectl describe node <node-name>
kubectl top nodes
\`\`\`

**Solutions:**
- Fix application code errors
- Increase resource limits (memory/CPU)
- Fix health check configuration
- Update container image to newer version`,
    confidence: 0.92,
    sources: [
      {
        documentName: 'kubernetes-troubleshooting.md',
        department: 'Engineering',
        category: 'Troubleshooting',
        chunkIndex: 1,
        sourceNumber: 1
      }
    ]
  },

  '502': {
    answer: `A 502 Bad Gateway occurs when the server received an invalid response from an upstream server.

**Common Causes:**
1. **Upstream Service is Down** - The backend service is not running
2. **Upstream Service is Slow** - Response timeout from upstream
3. **Misconfigured Proxy** - Incorrect proxy configuration
4. **Load Balancer Issues** - Problem in the load balancing layer
5. **Database Unreachable** - Cannot connect to database

**Diagnosis Steps:**

1. **Check Upstream Service Status**
\`\`\`bash
curl -v http://upstream-service:8080/health
systemctl status upstream-service
\`\`\`

2. **Verify Network Connectivity**
\`\`\`bash
nc -zv upstream-service 8080
ping upstream-service
\`\`\`

3. **Check Proxy Configuration**
\`\`\`bash
cat /etc/nginx/nginx.conf
\`\`\`

4. **Monitor Request Timeouts**
- Increase timeout values in proxy configuration
- Optimize upstream service performance
- Add caching layer

**Solution Example (Nginx):**
\`\`\`nginx
upstream backend {
  server upstream-service:8080;
  keepalive 64;
}

server {
  location / {
    proxy_pass http://backend;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }
}
\`\`\``,
    confidence: 0.89,
    sources: [
      {
        documentName: 'http-errors.md',
        department: 'Engineering',
        category: 'Troubleshooting',
        chunkIndex: 2,
        sourceNumber: 1
      }
    ]
  },

  'imagepullbackoff': {
    answer: `ImagePullBackOff is an error that indicates Kubernetes cannot pull the container image from the registry.

**Common Causes:**
1. **Image Not Found** - The image doesn't exist in the registry
2. **Authentication Failure** - Invalid credentials for private registry
3. **Network Issues** - Cannot reach the registry
4. **Incorrect Image Name** - Typo in image name or tag

**How to Troubleshoot:**

1. **Check Image Existence**
\`\`\`bash
docker pull <image-name>:<tag>
\`\`\`

2. **For Private Registry**
\`\`\`bash
docker login <registry>
docker pull <registry>/<image-name>:<tag>
\`\`\`

3. **Create Image Pull Secret**
\`\`\`bash
kubectl create secret docker-registry regcred \\
  --docker-server=<registry> \\
  --docker-username=<username> \\
  --docker-password=<password> \\
  -n <namespace>
\`\`\`

4. **Update Pod Spec**
\`\`\`yaml
imagePullSecrets:
- name: regcred
\`\`\`

**Solutions:**
- Correct the image name spelling
- Use correct image tag (avoid "latest" in production)
- Add image pull secrets for private registries
- Verify registry connectivity`,
    confidence: 0.87,
    sources: [
      {
        documentName: 'kubernetes-troubleshooting.md',
        department: 'Engineering',
        category: 'Troubleshooting',
        chunkIndex: 3,
        sourceNumber: 1
      }
    ]
  }
};

function getCachedResponse(query) {
  const queryHash = crypto.createHash('sha256').update(query).digest('hex');
  return storage.cache[queryHash];
}

function cacheResponse(query, response) {
  const queryHash = crypto.createHash('sha256').update(query).digest('hex');
  storage.cache[queryHash] = {
    ...response,
    cachedAt: new Date().toISOString()
  };
  saveData();
}

function findDemoAnswer(query) {
  const lowerQuery = query.toLowerCase();

  for (const [keyword, answer] of Object.entries(DEMO_ANSWERS)) {
    if (lowerQuery.includes(keyword)) {
      return answer;
    }
  }

  return null;
}

export async function answerQuestion(query, options = {}) {
  const {
    searchType = 'hybrid',
    topK = parseInt(process.env.TOP_K_RESULTS || 5),
    filters = {},
    useCache = true
  } = options;

  // Check cache
  if (useCache) {
    const cached = getCachedResponse(query);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  // Try demo mode first
  const demoAnswer = findDemoAnswer(query);
  if (demoAnswer) {
    const response = {
      ...demoAnswer,
      retrievedChunks: demoAnswer.sources.length,
      searchType: 'demo',
      hallucinated: false,
      timestamp: new Date(),
      demoMode: true
    };

    if (useCache) {
      cacheResponse(query, response);
    }

    storage.analytics.push({
      id: crypto.randomUUID(),
      query,
      search_type: 'demo',
      results_count: demoAnswer.sources.length,
      user_feedback: null,
      created_at: new Date().toISOString()
    });
    saveData();

    return response;
  }

  // Try retrieval-based search
  let retrievedChunks;

  if (searchType === 'vector') {
    const { vectorSearch } = await import('./retrievalServiceSimple.js');
    retrievedChunks = await vectorSearch(query, topK, filters);
  } else if (searchType === 'keyword') {
    const { keywordSearch } = await import('./retrievalServiceSimple.js');
    retrievedChunks = await keywordSearch(query, topK, filters);
  } else {
    retrievedChunks = await hybridSearch(query, topK, filters);
  }

  const hasRelevantResults = retrievedChunks.length > 0 &&
    (searchType === 'keyword' || retrievedChunks[0].similarity >= SIMILARITY_THRESHOLD);

  if (!hasRelevantResults || retrievedChunks.length === 0) {
    const response = {
      answer: 'I cannot find relevant information in the knowledge base to answer your question. Try uploading more documents or rephrasing your question.',
      sources: [],
      confidence: 0,
      retrievedChunks: 0,
      hallucinated: false,
      timestamp: new Date(),
      demoMode: true
    };

    if (useCache) {
      cacheResponse(query, response);
    }

    return response;
  }

  // Build answer from retrieved chunks
  const context = retrievedChunks
    .map((chunk, index) => `[Source ${index + 1}] (${chunk.document_name})\n${chunk.content}`)
    .join('\n\n');

  // Generate generic response based on content
  const answer = `Based on the knowledge base:\n\n${context.substring(0, 1000)}...\n\nFor more detailed information, please review the sources below.`;

  const sources = retrievedChunks.map((chunk, index) => ({
    documentId: chunk.document_id,
    documentName: chunk.document_name,
    department: chunk.department,
    category: chunk.category,
    chunkContent: chunk.content.substring(0, 300),
    chunkIndex: chunk.chunk_index,
    similarity: chunk.similarity || chunk.rank || null,
    sourceNumber: index + 1
  }));

  const result = {
    answer,
    sources,
    confidence: Math.min(retrievedChunks[0].similarity || 0.8, 1),
    retrievedChunks: retrievedChunks.length,
    searchType,
    hallucinated: false,
    timestamp: new Date(),
    demoMode: true
  };

  if (useCache) {
    cacheResponse(query, result);
  }

  storage.analytics.push({
    id: crypto.randomUUID(),
    query,
    search_type: searchType,
    results_count: retrievedChunks.length,
    user_feedback: null,
    created_at: new Date().toISOString()
  });
  saveData();

  return result;
}

export async function logFeedback(queryText, feedback) {
  const record = storage.analytics.find(a => a.query === queryText);
  if (record) {
    record.user_feedback = feedback;
    await saveData();
  }
}

export default {
  answerQuestion,
  logFeedback
};

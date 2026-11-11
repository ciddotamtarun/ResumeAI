import {
  Code2,
  Database,
  Layers,
  Bug,
  Cpu,
  Terminal,
  Sparkles,
  Server,
  Cloud,
  Shield,
  BarChart2,
  FileCode,
} from 'lucide-react';

export interface Question {
  id: string;
  topic: string;
  question: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  practiceTip: string;
}

export interface DomainAssessment {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  category: string;
  icon: any;
  questions: Question[];
}

export interface TechnicalRoundMode {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Difficult';
  duration: string;
  questionCount: number;
  icon: any;
  domainId: string;
  applicableRoles: string[]; // If empty, applicable to all tech roles
}

export const TECHNICAL_ROUND_MODES: TechnicalRoundMode[] = [
  {
    id: 'fundamentals',
    title: 'Technical Fundamentals',
    description: 'Core language semantics, memory models, runtime behaviors, and typing concepts.',
    difficulty: 'Medium',
    duration: '15 mins',
    questionCount: 5,
    icon: Terminal,
    domainId: 'javascript', // dynamically adapts to role (e.g. python/java/js)
    applicableRoles: [],
  },
  {
    id: 'coding',
    title: 'Coding & Problem Solving',
    description: 'Algorithmic efficiency, time/space complexity, data structures, and edge case handling.',
    difficulty: 'Difficult',
    duration: '20 mins',
    questionCount: 5,
    icon: Code2,
    domainId: 'coding_problem_solving',
    applicableRoles: [
      'Full Stack Developer',
      'Backend Developer',
      'Frontend Developer',
      'Software Engineer',
      'Data Scientist',
      'ML / AI Engineer',
      'Mobile Developer',
    ],
  },
  {
    id: 'sql',
    title: 'SQL & Database Queries',
    description: 'Complex multi-table joins, window functions, schema indexing, and transaction isolation.',
    difficulty: 'Medium',
    duration: '15 mins',
    questionCount: 5,
    icon: Database,
    domainId: 'sql',
    applicableRoles: [
      'Full Stack Developer',
      'Backend Developer',
      'Data Analyst',
      'Data Scientist',
      'Software Engineer',
      'Business Analyst',
    ],
  },
  {
    id: 'debugging',
    title: 'Debugging & Code Review',
    description: 'Identify logic flaws, race conditions, memory leaks, and architectural anti-patterns.',
    difficulty: 'Difficult',
    duration: '20 mins',
    questionCount: 5,
    icon: Bug,
    domainId: 'debugging',
    applicableRoles: [
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'DevOps Engineer',
      'QA / Test Engineer',
      'Mobile Developer',
      'Software Engineer',
    ],
  },
  {
    id: 'framework',
    title: 'Framework & Technology Questions',
    description: 'Deep dive into production frameworks, component architecture, APIs, and containerization.',
    difficulty: 'Medium',
    duration: '15 mins',
    questionCount: 5,
    icon: Layers,
    domainId: 'react', // adapts to role (react/nodejs/devops/data_analysis)
    applicableRoles: [],
  },
  {
    id: 'project',
    title: 'Resume Project-Based Questions',
    description: 'Architectural trade-offs, scalability bottlenecks, caching strategies, and API reliability.',
    difficulty: 'Difficult',
    duration: '20 mins',
    questionCount: 5,
    icon: Cpu,
    domainId: 'project_architecture',
    applicableRoles: [],
  },
  {
    id: 'mixed',
    title: 'Mixed Technical Assessment',
    description: 'Comprehensive simulation combining coding, architecture, databases, and debugging in one sitting.',
    difficulty: 'Difficult',
    duration: '25 mins',
    questionCount: 10,
    icon: Sparkles,
    domainId: 'mixed',
    applicableRoles: [],
  },
];

export const QUESTION_BANKS: Record<string, DomainAssessment> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript & TypeScript',
    description: 'Event loop mechanics, async/await, closures, prototypes, and TypeScript type systems',
    badgeColor: '#B7791F',
    category: 'Frontend & Full Stack',
    icon: Code2,
    questions: [
      {
        id: 'js_1',
        topic: 'Event Loop & Microtasks',
        question: 'What is the exact execution output order of the following JavaScript snippet?',
        code: `console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');`,
        options: ['A, B, C, D', 'A, D, C, B', 'A, D, B, C', 'A, C, D, B'],
        correctIndex: 1,
        explanation: 'Synchronous statements run first (A, D). Microtasks (Promise.then) execute immediately after synchronous code before macrotasks (setTimeout), yielding A, D, C, B.',
        practiceTip: 'Understanding the microtask queue is critical for avoiding race conditions in UI state updates.',
      },
      {
        id: 'js_2',
        topic: 'Closures & Scope',
        question: 'What defines a JavaScript closure?',
        options: [
          'An immediately invoked function expression (IIFE)',
          'A function bundled with references to its surrounding lexical state (lexical environment)',
          'A method declared with the private keyword in ES2022',
          'A syntax error caused by an unclosed curly brace',
        ],
        correctIndex: 1,
        explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has returned.',
        practiceTip: 'Closures power factory functions, data encapsulation, and custom React hooks.',
      },
      {
        id: 'js_3',
        topic: 'TypeScript Type Narrowing',
        question: 'In TypeScript, what is the effect of the unknown type compared to any?',
        options: [
          'unknown is identical to any',
          'unknown requires type narrowing or assertion before operations can be performed on the value',
          'unknown allows all operations without compile-time type checks',
          'unknown can only hold primitive strings and numbers',
        ],
        correctIndex: 1,
        explanation: 'unknown is the type-safe counterpart of any. Any value is assignable to unknown, but TypeScript disallows property access until narrowed.',
        practiceTip: 'Prefer unknown over any for API responses and third-party inputs.',
      },
      {
        id: 'js_4',
        topic: 'Object Cloning & References',
        question: 'What is the primary advantage of the native structuredClone() method over JSON.parse(JSON.stringify(obj))?',
        options: [
          'structuredClone() supports circular references, Dates, RegExps, Maps, Sets, and ArrayBuffers',
          'structuredClone() clones functions and prototype chains',
          'structuredClone() runs synchronously in a Web Worker',
          'structuredClone() works only on simple JSON objects',
        ],
        correctIndex: 0,
        explanation: 'structuredClone() handles complex nested types and circular references that break JSON.stringify().',
        practiceTip: 'Use structuredClone(obj) for reliable deep copying in modern web browsers and Node 17+.',
      },
      {
        id: 'js_5',
        topic: 'Lexical vs Dynamic This',
        question: 'How does arrow function syntax () => {} handle the this context compared to function() {}?',
        options: [
          'Arrow functions create their own dynamic this bound to the caller',
          'Arrow functions retain the lexical this of the enclosing execution context',
          'Arrow functions always bind this to window or global',
          'Arrow functions throw an error if this is accessed',
        ],
        correctIndex: 1,
        explanation: 'Arrow functions do not define their own this. They inherit this from the parent lexical scope.',
        practiceTip: 'Do not use arrow functions for object methods that need access to this.propertyName.',
      },
    ],
  },

  react: {
    id: 'react',
    name: 'React & Modern Frontend',
    description: 'Component lifecycles, custom hooks, memoization, state management, and rendering optimization',
    badgeColor: '#0EA5E9',
    category: 'Frontend & Full Stack',
    icon: Layers,
    questions: [
      {
        id: 'react_1',
        topic: 'Hook Dependencies',
        question: 'In React, what occurs if an object or function created inside a component body is included in a useEffect dependency array without memoization?',
        options: [
          'The effect runs only once on initial mount',
          'The effect triggers on every render because a new reference is generated on each render cycle',
          'React throws a compile-time type error',
          'React automatically memoizes unmemoized functions',
        ],
        correctIndex: 1,
        explanation: 'In JavaScript, {} !== {} and functions have new references on every render. Without useCallback or useMemo, reference equality fails, re-running the effect.',
        practiceTip: 'Wrap callbacks passed into dependency arrays with useCallback or move them inside the effect.',
      },
      {
        id: 'react_2',
        topic: 'Render Optimization',
        question: 'What is the primary difference between React.memo and useMemo?',
        options: [
          'React.memo is a Higher-Order Component for memoizing component render outputs; useMemo memoizes computed values inside a component',
          'React.memo runs only on server components; useMemo runs on client components',
          'React.memo caches network requests; useMemo caches Redux states',
          'They are identical aliases introduced in React 18',
        ],
        correctIndex: 0,
        explanation: 'React.memo prevents re-renders of a component when props haven’t changed. useMemo caches the return value of an expensive calculation between renders.',
        practiceTip: 'Use React.memo on pure presentation components that receive stable props in frequently updating parents.',
      },
      {
        id: 'react_3',
        topic: 'Custom Hooks',
        question: 'Which of the following violates the Rules of Hooks in React?',
        options: [
          'Calling a custom hook inside another custom hook',
          'Calling useState conditionally inside an if statement block',
          'Calling useEffect at the top level of a functional component',
          'Passing a state setter callback to a child component',
        ],
        correctIndex: 1,
        explanation: 'Hooks must always be called at the top level of React functions, before any early returns or conditional blocks, to preserve call order consistency.',
        practiceTip: 'Place conditions inside the hook body rather than wrapping the hook call with a condition.',
      },
      {
        id: 'react_4',
        topic: 'State Batching',
        question: 'How does React 18 handle automatic state batching across asynchronous boundaries (e.g. inside setTimeout or fetch)?',
        options: [
          'It batches multiple state updates together into a single re-render automatically',
          'It forces immediate synchronous rendering for every state setter inside promises',
          'It throws a warning unless wrapped in ReactDOM.flushSync',
          'Automatic batching only applies to class components',
        ],
        correctIndex: 0,
        explanation: 'React 18 introduced automatic batching for all updates, including promises, timeouts, and native event handlers, improving rendering performance.',
        practiceTip: 'If you ever need an immediate DOM update before the next line of code, opt-out with flushSync().',
      },
      {
        id: 'react_5',
        topic: 'Keys in Lists',
        question: 'Why should array indices generally be avoided as key props for dynamically reordered lists?',
        options: [
          'Indices cause network re-fetching on scroll',
          'Reordering or deleting items causes component state to map to incorrect DOM nodes, triggering visual bugs and unnecessary re-renders',
          'React does not allow numeric keys',
          'Array indices prevent CSS transitions from executing',
        ],
        correctIndex: 1,
        explanation: 'React uses keys to identify which items have changed, been added, or removed. Using index confuses React’s reconciliation algorithm when items are sorted or deleted.',
        practiceTip: 'Always use stable, unique IDs (e.g., database primary keys or UUIDs) for list keys.',
      },
    ],
  },

  python: {
    id: 'python',
    name: 'Python Core & Architecture',
    description: 'Data structures, mutable defaults, decorators, generators, and async programming',
    badgeColor: '#4F46D8',
    category: 'Backend & Data',
    icon: Code2,
    questions: [
      {
        id: 'py_1',
        topic: 'Mutable Defaults',
        question: 'What is the output of the following Python code snippet regarding mutable default arguments?',
        code: `def append_item(val, items=[]):\n    items.append(val)\n    return items\n\nprint(append_item(1))\nprint(append_item(2))`,
        options: ['[1] then [2]', '[1] then [1, 2]', '[1, 2] then [1, 2]', 'TypeError: mutable default forbidden'],
        correctIndex: 1,
        explanation: 'In Python, default arguments are evaluated only once when the function is defined. The list items is retained and shared across subsequent invocations.',
        practiceTip: 'Always use items=None and initialize inside the function (if items is None: items = []).',
      },
      {
        id: 'py_2',
        topic: 'Generators & Memory',
        question: 'What is the principal difference between a list comprehension and a generator expression?',
        code: `list_comp = [x * 2 for x in range(1000000)]\ngen_exp = (x * 2 for x in range(1000000))`,
        options: [
          'List comprehensions are lazy; generator expressions evaluate immediately',
          'List comprehension allocates memory for all elements upfront; generator expression yields items on demand using O(1) memory',
          'Generator expressions can be indexed with gen_exp[0]; lists cannot',
          'There is no difference in memory allocation',
        ],
        correctIndex: 1,
        explanation: 'Generator expressions return a generator iterator that computes values lazily on-the-fly, consuming constant memory regardless of stream size.',
        practiceTip: 'Use generator expressions for large file processing or pipeline operations.',
      },
      {
        id: 'py_3',
        topic: 'Decorators & Metadata',
        question: 'What is the primary function of @functools.wraps(fn) when writing a custom decorator?',
        options: [
          'It compiles the function to bytecode for faster execution',
          'It preserves original metadata like the docstring, function name, and signature',
          'It prevents recursion depth limits',
          'It automatically types the return arguments',
        ],
        correctIndex: 1,
        explanation: 'Without @functools.wraps, the decorated function would have its __name__ and __doc__ overwritten by the wrapper function.',
        practiceTip: 'Always decorate wrapper functions with @wraps(fn) to preserve debugging and introspection clarity.',
      },
      {
        id: 'py_4',
        topic: 'Asynchronous Concurrency',
        question: 'How does asyncio.gather(*tasks, return_exceptions=True) handle exceptions compared to return_exceptions=False?',
        options: [
          'It aborts all tasks immediately upon the first failure',
          'Exceptions are treated as return values in the results list, allowing other tasks to complete',
          'It automatically retries failed tasks up to 3 times',
          'It suppresses exceptions without returning anything',
        ],
        correctIndex: 1,
        explanation: 'With return_exceptions=True, errors are returned alongside successful results rather than cancelling the remaining awaited coroutines.',
        practiceTip: 'Use return_exceptions=True when orchestrating batch API requests where individual failures should not break the pipeline.',
      },
      {
        id: 'py_5',
        topic: 'GIL & Multithreading',
        question: 'What does the Global Interpreter Lock (GIL) in CPython prevent?',
        options: [
          'Multiple OS processes from running simultaneously',
          'Multiple native threads from executing Python bytecode simultaneously within a single process',
          'Asynchronous event loop execution',
          'Memory leaks from circular references',
        ],
        correctIndex: 1,
        explanation: 'The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode at once in CPython.',
        practiceTip: 'For CPU-bound tasks, utilize multiprocessing or native C-extensions; for I/O bound tasks, use asyncio or threading.',
      },
    ],
  },

  sql: {
    id: 'sql',
    name: 'SQL & Database Architecture',
    description: 'Complex joins, window functions, indexing strategies, and transaction isolation',
    badgeColor: '#168575',
    category: 'Database & Data',
    icon: Database,
    questions: [
      {
        id: 'sql_1',
        topic: 'Joins & Null Handling',
        question: 'What will be returned for rows in the left table that have no matching records in the right table during a LEFT JOIN?',
        options: [
          'The row is discarded from the output',
          'Columns from the right table are populated with NULL values',
          'An empty string is substituted for missing keys',
          'A database constraint violation error is raised',
        ],
        correctIndex: 1,
        explanation: 'A LEFT JOIN guarantees that every row from the left table is preserved, filling unmatched right-table columns with NULL.',
        practiceTip: 'To find records missing in the right table, use LEFT JOIN ... WHERE right_table.id IS NULL.',
      },
      {
        id: 'sql_2',
        topic: 'Query Execution Order',
        question: 'In SQL query execution order, which clause is evaluated directly AFTER GROUP BY?',
        options: ['WHERE', 'HAVING', 'SELECT', 'ORDER BY'],
        correctIndex: 1,
        explanation: 'Logical query processing sequence: FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT.',
        practiceTip: 'Use WHERE to filter individual rows before aggregation, and HAVING to filter aggregated groups.',
      },
      {
        id: 'sql_3',
        topic: 'Window Functions',
        question: 'What is the key difference between RANK() and DENSE_RANK() window functions when duplicate values occur?',
        options: [
          'RANK() skips subsequent rank numbers after ties (e.g. 1, 2, 2, 4); DENSE_RANK() does not skip (e.g. 1, 2, 2, 3)',
          'DENSE_RANK() sorts descending while RANK() sorts ascending',
          'RANK() requires an aggregation clause; DENSE_RANK() operates on unindexed tables only',
          'They are identical aliases in ANSI SQL',
        ],
        correctIndex: 0,
        explanation: 'RANK() creates gaps in numbering after ties, whereas DENSE_RANK() assigns contiguous consecutive integers.',
        practiceTip: 'Use DENSE_RANK() when you need top N distinct tiers without number gaps.',
      },
      {
        id: 'sql_4',
        topic: 'Index Selection & Leftmost Prefix',
        question: 'Given a composite B-Tree index on (department_id, salary), which of the following queries CANNOT efficiently utilize the index?',
        options: [
          'WHERE department_id = 5 AND salary > 80000',
          'WHERE department_id = 5',
          'WHERE salary > 80000 (without department_id specified)',
          'WHERE department_id IN (1, 2, 3) ORDER BY salary',
        ],
        correctIndex: 2,
        explanation: 'B-Tree indexes follow the leftmost prefix rule. An index on (A, B) cannot be used for filtering solely on B without A.',
        practiceTip: 'Design composite index column order based on query predicate frequency and equality conditions first.',
      },
      {
        id: 'sql_5',
        topic: 'ACID & Isolation Levels',
        question: 'In database transaction management, what phenomenon does the "Read Committed" isolation level prevent?',
        options: [
          'Dirty Reads (reading uncommitted changes from another transaction)',
          'Non-repeatable reads',
          'Phantom reads',
          'Serialization anomalies',
        ],
        correctIndex: 0,
        explanation: 'Read Committed ensures a transaction only reads committed data, preventing Dirty Reads. Repeatable Read and Serializable prevent higher-level anomalies.',
        practiceTip: 'For financial ledgers requiring total isolation, specify SERIALIZABLE or optimistic row locking.',
      },
    ],
  },

  nodejs: {
    id: 'nodejs',
    name: 'Node.js & Backend Architecture',
    description: 'Event-driven I/O, streams, REST API standards, middleware, and authentication',
    badgeColor: '#15803D',
    category: 'Backend & Full Stack',
    icon: Server,
    questions: [
      {
        id: 'node_1',
        topic: 'Streams vs Buffers',
        question: 'Why should large file downloads in Node.js be served using fs.createReadStream().pipe(res) instead of fs.readFile()?',
        options: [
          'createReadStream streams data in chunks without buffering the whole file in RAM, avoiding high memory spikes',
          'createReadStream automatically compresses files with gzip',
          'fs.readFile() cannot read binary files',
          'Node.js disallows fs.readFile() in HTTP responses',
        ],
        correctIndex: 0,
        explanation: 'Streams process data piece by piece (typically 64KB chunks), preventing memory exhaustion when handling concurrent large file transfers.',
        practiceTip: 'Always use stream pipelines with error handling (stream.pipeline) for file operations and API proxies.',
      },
      {
        id: 'node_2',
        topic: 'HTTP Status Codes',
        question: 'Which HTTP status code is most appropriate when a client submits a valid request with malformed JSON syntax or semantic validation errors?',
        options: ['400 Bad Request or 422 Unprocessable Entity', '500 Internal Server Error', '403 Forbidden', '304 Not Modified'],
        correctIndex: 0,
        explanation: '400 Bad Request indicates malformed syntax; 422 Unprocessable Entity indicates well-formed syntax that contains semantic validation errors.',
        practiceTip: 'Reserve 500 status codes strictly for unexpected server crashes, never for client validation errors.',
      },
      {
        id: 'node_3',
        topic: 'Middleware & Error Handling',
        question: 'In Express.js, what is the required signature for an error-handling middleware function to be recognized by Express?',
        options: [
          '(err, req, res, next) — exactly 4 arguments',
          '(req, res, err) — exactly 3 arguments',
          '(err, res) — 2 arguments',
          'async (error) => {}',
        ],
        correctIndex: 0,
        explanation: 'Express inspects function arity (fn.length). Only middleware with 4 arguments (err, req, res, next) are invoked as error handlers.',
        practiceTip: 'Always place your 4-argument error handler at the very end of your middleware stack after all route definitions.',
      },
      {
        id: 'node_4',
        topic: 'JWT Security',
        question: 'Where should sensitive JWT access tokens ideally be stored in a web browser to mitigate Cross-Site Scripting (XSS) token theft?',
        options: [
          'In an HttpOnly, Secure, SameSite cookie',
          'In browser localStorage',
          'In the browser URL query parameters',
          'In sessionStorage with a base64 encoding',
        ],
        correctIndex: 0,
        explanation: 'HttpOnly cookies cannot be accessed by client-side JavaScript, protecting tokens from being stolen if an XSS vulnerability exists.',
        practiceTip: 'Pair HttpOnly cookies with CSRF tokens or SameSite=Strict policies to defend against both XSS and CSRF.',
      },
      {
        id: 'node_5',
        topic: 'Process Management',
        question: 'What happens when an uncaught promise rejection occurs in modern Node.js versions (v16+)?',
        options: [
          'The Node.js process terminates immediately with an unhandled rejection exit code',
          'It is silently logged to stdout without impacting the process',
          'It automatically retries the asynchronous function',
          'Node.js spawns a new worker thread',
        ],
        correctIndex: 0,
        explanation: 'In modern Node.js, unhandled promise rejections are treated as fatal errors, terminating the process to prevent corrupted application state.',
        practiceTip: 'Always register process.on("unhandledRejection") and wrap async express route handlers in try/catch or async wrappers.',
      },
    ],
  },

  devops: {
    id: 'devops',
    name: 'DevOps & Cloud Infrastructure',
    description: 'Docker, Kubernetes, CI/CD automation, Linux internals, and cloud governance',
    badgeColor: '#D97706',
    category: 'DevOps & Cloud',
    icon: Cloud,
    questions: [
      {
        id: 'devops_1',
        topic: 'Docker Multi-Stage Builds',
        question: 'What is the primary benefit of using Multi-Stage Builds in Dockerfiles?',
        options: [
          'To separate build tools and intermediate artifacts from the final minimal production runtime image',
          'To build images for multiple CPU architectures simultaneously',
          'To automatically push images to Docker Hub during build',
          'To run multiple containers inside a single image',
        ],
        correctIndex: 0,
        explanation: 'Multi-stage builds allow you to use large SDKs and compilers in early stages, copying only the compiled artifacts into a lean runtime image (e.g. Alpine/Distroless).',
        practiceTip: 'Use multi-stage builds to shrink attack surfaces and reduce Docker image pull times in Kubernetes.',
      },
      {
        id: 'devops_2',
        topic: 'Kubernetes Pod Networking',
        question: 'In Kubernetes, which resource type provides a stable virtual IP address and load balances traffic across a dynamic set of Pods matching a label selector?',
        options: ['Service (ClusterIP, NodePort, LoadBalancer)', 'Ingress Controller', 'ConfigMap', 'DaemonSet'],
        correctIndex: 0,
        explanation: 'A Kubernetes Service acts as a persistent layer 4 abstraction over ephemeral Pods, automatically routing traffic based on label selectors.',
        practiceTip: 'Use ClusterIP for internal microservice communication and Ingress for external HTTP/HTTPS routing.',
      },
      {
        id: 'devops_3',
        topic: 'CI/CD Best Practices',
        question: 'What distinguishes Continuous Delivery from Continuous Deployment?',
        options: [
          'In Continuous Delivery, production release requires a manual approval gate; in Continuous Deployment, passing pipelines release to production automatically',
          'Continuous Delivery only applies to frontends; Continuous Deployment applies to databases',
          'Continuous Delivery does not include automated testing',
          'They are interchangeable terms with no difference',
        ],
        correctIndex: 0,
        explanation: 'Continuous Delivery ensures every build is always releasable to production upon manual trigger. Continuous Deployment automates release all the way into production without human intervention.',
        practiceTip: 'Implement comprehensive canary deployments and automated rollback monitors before enabling Continuous Deployment.',
      },
      {
        id: 'devops_4',
        topic: 'Linux Signals & Containers',
        question: 'When docker stop or kubectl delete pod is invoked, which POSIX signal is sent first to allow graceful container termination before SIGKILL?',
        options: ['SIGTERM (Signal 15)', 'SIGINT (Signal 2)', 'SIGSTOP (Signal 19)', 'SIGHUP (Signal 1)'],
        correctIndex: 0,
        explanation: 'Containers receive SIGTERM first, allowing the application a grace period (default 30 seconds) to close active database connections and complete inflight HTTP requests before SIGKILL.',
        practiceTip: 'Handle process.on("SIGTERM") in your application servers to gracefully drain connections.',
      },
      {
        id: 'devops_5',
        topic: 'Infrastructure as Code (IaC)',
        question: 'In Terraform, what is the purpose of the state file (terraform.tfstate)?',
        options: [
          'It maps real-world provisioned cloud infrastructure to your configuration code and tracks metadata',
          'It stores user passwords and cloud billing receipts',
          'It is an executable script that runs on virtual machines',
          'It caches Docker container images',
        ],
        correctIndex: 0,
        explanation: 'Terraform uses the state file to determine what resources to create, update, or destroy based on the delta between code configuration and deployed reality.',
        practiceTip: 'Store Terraform state in remote object storage (like AWS S3 or GCS) with state locking (DynamoDB) enabled.',
      },
    ],
  },

  coding_problem_solving: {
    id: 'coding_problem_solving',
    name: 'Coding & Algorithmic Problem Solving',
    description: 'Data structure trade-offs, two-pointer techniques, hash map lookups, and complexity analysis',
    badgeColor: '#7C3AED',
    category: 'Computer Science Core',
    icon: Code2,
    questions: [
      {
        id: 'algo_1',
        topic: 'Time & Space Complexity',
        question: 'Given an unsorted array of N integers, what is the optimal time and space complexity to find two numbers that sum up to a target value?',
        options: [
          'O(N) Time and O(N) Space using a Hash Map',
          'O(N^2) Time and O(1) Space using nested loops only',
          'O(log N) Time and O(1) Space',
          'O(N!) Time and O(N) Space',
        ],
        correctIndex: 0,
        explanation: 'Using a Hash Map to store seen complements allows single-pass O(N) time and O(N) space. Sorting first allows O(N log N) time and O(1) space with two pointers.',
        practiceTip: 'When optimizing O(N^2) search problems, always evaluate if a Hash Map space trade-off gets you to O(N).',
      },
      {
        id: 'algo_2',
        topic: 'Binary Search Edge Cases',
        question: 'In standard binary search over a sorted array, why is mid often calculated as `mid = low + Math.floor((high - low) / 2)` instead of `(low + high) / 2`?',
        options: [
          'To prevent integer overflow in languages with fixed integer bit widths (like Java, C++, or Go)',
          'Because JavaScript does not support division',
          'To ensure binary search always rounds up',
          'There is no difference in any programming language',
        ],
        correctIndex: 0,
        explanation: 'In 32-bit signed integer representations, `low + high` can exceed 2^31 - 1, causing arithmetic overflow. `low + (high - low) / 2` safely avoids this overflow.',
        practiceTip: 'Always use overflow-safe index calculations in binary searches and divide-and-conquer algorithms.',
      },
      {
        id: 'algo_3',
        topic: 'Data Structure Selection',
        question: 'Which data structure offers O(1) average time complexity for both inserting a new element and retrieving the minimum/maximum element at any time?',
        options: [
          'Min/Max Heap allows O(log N) insert and O(1) peek; Min-Stack allows O(1) push and O(1) getMin()',
          'A standard Linked List provides O(1) for both',
          'A Binary Search Tree guarantees O(1) in the worst case',
          'An unindexed array',
        ],
        correctIndex: 0,
        explanation: 'A Min-Stack tracking minimums alongside values achieves O(1) time for push, pop, and getMin. A Binary Heap achieves O(log N) insert and O(1) findMin.',
        practiceTip: 'Use a secondary min-tracking stack when you need constant time minimum retrieval with LIFO semantics.',
      },
      {
        id: 'algo_4',
        topic: 'Sliding Window',
        question: 'When is the Sliding Window algorithmic technique applicable over an array or string?',
        options: [
          'When finding optimal contiguous subarrays or substrings satisfying a specific condition',
          'Only when the array is sorted in ascending order',
          'When building binary search trees',
          'When matrix transpositions are required',
        ],
        correctIndex: 0,
        explanation: 'Sliding window converts nested O(N^2) subarray iterations into linear O(N) time by expanding and contracting window boundaries.',
        practiceTip: 'Use a dynamic sliding window with two pointers when searching for longest/shortest substrings with K distinct elements.',
      },
      {
        id: 'algo_5',
        topic: 'Recursion & Call Stacks',
        question: 'What causes a Stack Overflow error during deep recursion?',
        options: [
          'The call stack memory limit is exceeded due to missing or unreachable base cases',
          'The computer runs out of physical disk space',
          'The CPU clock speed decreases',
          'Variables are stored in the heap instead of the stack',
        ],
        correctIndex: 0,
        explanation: 'Each recursive call allocates a stack frame. Without a valid base case, frames accumulate until the allocated thread call stack memory is exhausted.',
        practiceTip: 'Refactor deep recursion into iterative loops using explicit stack data structures or verify tail-call optimization.',
      },
    ],
  },

  debugging: {
    id: 'debugging',
    name: 'Debugging & Code Review',
    description: 'Spotting logic errors, memory leaks, concurrency bugs, and anti-patterns',
    badgeColor: '#E11D48',
    category: 'Engineering Quality',
    icon: Bug,
    questions: [
      {
        id: 'dbg_1',
        topic: 'Memory Leak Diagnosis',
        question: 'Which of the following in a Single Page Application (SPA) is the most common cause of client-side memory leaks over long user sessions?',
        options: [
          'Uncleaned event listeners, intervals, or WebSocket subscriptions in unmounted components',
          'Declaring too many const variables inside a function',
          'Using modern CSS Flexbox and Grid',
          'Rendering SVG icons in the navigation bar',
        ],
        correctIndex: 0,
        explanation: 'If `addEventListener` or `setInterval` is created in an effect without removing it in the cleanup return function, the callback retains references to the unmounted component tree in memory.',
        practiceTip: 'Always return cleanup functions from `useEffect` to remove event listeners and abort pending network requests.',
      },
      {
        id: 'dbg_2',
        topic: 'Race Conditions',
        question: 'In an autocomplete search input, how do you prevent an earlier slow HTTP request from overwriting a later, fast HTTP response (race condition)?',
        options: [
          'Use `AbortController` to cancel previous in-flight requests or track request sequence IDs',
          'Increase the server CPU capacity',
          'Disable client caching',
          'Add a 5-second `setTimeout` before every request',
        ],
        correctIndex: 0,
        explanation: 'Network latency varies. Using `AbortController.abort()` cancels the previous fetch before initiating a new one, ensuring only the latest query updates state.',
        practiceTip: 'Integrate `AbortController` with input debouncing for responsive and race-condition-free autocomplete.',
      },
      {
        id: 'dbg_3',
        topic: 'Floating Point Precision',
        question: 'Why does `0.1 + 0.2 === 0.3` evaluate to `false` in JavaScript, Python, and other IEEE 754 languages?',
        options: [
          'Binary floating-point cannot represent base-10 fractions like 0.1 and 0.2 exactly, resulting in 0.30000000000000004',
          'JavaScript integers are 16-bit',
          'The equality operator `===` performs string comparison on floats',
          'Because 0.3 is an imaginary number in binary',
        ],
        correctIndex: 0,
        explanation: 'Fractions like 1/10 repeat infinitely in binary floating-point. The rounding error makes the sum slightly larger than 0.3.',
        practiceTip: 'For monetary transactions, store values as integer cents or use arbitrary-precision decimal libraries (`decimal.js` or Python `decimal`).',
      },
      {
        id: 'dbg_4',
        topic: 'SQL Injection Remediation',
        question: 'During a security code review, what is the correct remediation for `db.query("SELECT * FROM users WHERE email = \\\'" + req.body.email + "\\\'")`?',
        options: [
          'Use parameterized queries / prepared statements (e.g. `db.query("SELECT * FROM users WHERE email = $1", [req.body.email])`)',
          'Replace all single quotes with double quotes manually',
          'Convert the email string to uppercase before querying',
          'Wrap the query in a try/catch block',
        ],
        correctIndex: 0,
        explanation: 'Parameterized queries send the SQL statement and data parameters separately to the database engine, rendering user input harmless as literals rather than executable SQL code.',
        practiceTip: 'Never concatenate user input into SQL strings; always enforce parameterized queries via your ORM or database driver.',
      },
      {
        id: 'dbg_5',
        topic: 'Off-By-One Errors',
        question: 'In array boundary iteration, what is the most common cause of an "IndexOutOfBoundsException" or `undefined` access in a 0-indexed array of length N?',
        options: [
          'Using loop condition `i <= array.length` instead of `i < array.length`',
          'Starting the loop at `i = 0`',
          'Incrementing by `i++`',
          'Using a while loop instead of a for loop',
        ],
        correctIndex: 0,
        explanation: 'In 0-indexed arrays of length N, valid indices range from 0 to N-1. When `i == N`, accessing `array[i]` attempts to read past the allocated boundary.',
        practiceTip: 'Prefer modern iteration abstractions (`for...of`, `.map`, `.forEach`) or strictly verify `i < array.length`.',
      },
    ],
  },

  project_architecture: {
    id: 'project_architecture',
    name: 'Project Architecture & System Design',
    description: 'Caching strategies, database sharding, microservice communication, and resilience patterns',
    badgeColor: '#059669',
    category: 'Architecture & Design',
    icon: Cpu,
    questions: [
      {
        id: 'arch_1',
        topic: 'Cache Invalidation Strategies',
        question: 'What is the primary trade-off of the "Cache-Aside" (Lazy Loading) pattern compared to "Write-Through" caching?',
        options: [
          'Cache-Aside only caches data when requested, minimizing cache churn, but experiences initial cache misses (cold starts); Write-Through updates cache on every write, ensuring fresher data at the expense of higher write latency',
          'Cache-Aside cannot be used with Redis',
          'Write-Through completely eliminates the need for database storage',
          'Cache-Aside guarantees immediate strong consistency across all nodes',
        ],
        correctIndex: 0,
        explanation: 'Cache-Aside lazily loads data on read misses. Write-Through updates the cache synchronously during write operations, ensuring data consistency at the cost of slower writes.',
        practiceTip: 'Pair Cache-Aside with sensible TTLs and event-driven cache eviction on entity updates.',
      },
      {
        id: 'arch_2',
        topic: 'Database Sharding & Partitioning',
        question: 'What is the most significant operational challenge introduced when horizontally sharding a database across multiple server nodes?',
        options: [
          'Cross-shard joins and distributed transactions become computationally expensive and complex to maintain',
          'Storage capacity decreases per node',
          'SQL syntax is completely forbidden in sharded systems',
          'Backups can no longer be taken',
        ],
        correctIndex: 0,
        explanation: 'Sharding distributes rows across nodes using a shard key. Joining tables across different shards requires cross-network coordination, breaking standard relational ACID guarantees without distributed consensus protocols (like Two-Phase Commit).',
        practiceTip: 'Carefully choose a shard key that colocates frequently joined tables onto the same physical node.',
      },
      {
        id: 'arch_3',
        topic: 'Idempotency in Distributed APIs',
        question: 'Why is idempotency essential for critical API endpoints like payment processing or order placement?',
        options: [
          'It guarantees that duplicate network retries with the same idempotency key result in the exact same state without charging the customer twice',
          'It automatically encrypts the payload with TLS 1.3',
          'It converts synchronous HTTP calls into WebSockets',
          'It allows clients to bypass authentication tokens',
        ],
        correctIndex: 0,
        explanation: 'Network timeouts often cause clients to retry requests that the server already processed. Idempotency keys allow servers to detect duplicate submissions and safely return the cached successful response.',
        practiceTip: 'Store idempotency keys in Redis with a short TTL (e.g. 24 hours) and check them in pre-routing middleware.',
      },
      {
        id: 'arch_4',
        topic: 'Circuit Breaker Pattern',
        question: 'In a microservice architecture, what is the role of the Circuit Breaker pattern (e.g. Resilience4j or Cockatiel)?',
        options: [
          'To temporarily stop sending requests to a degraded downstream service, preventing cascading failures and allowing the downstream service time to recover',
          'To break up monolithic Docker containers into microservices',
          'To terminate user sessions on password change',
          'To filter malicious DDoS attacks at the edge router',
        ],
        correctIndex: 0,
        explanation: 'When failure thresholds are exceeded, the circuit opens, failing fast or returning cached fallbacks rather than exhausting thread pools on timing out requests.',
        practiceTip: 'Configure circuit breakers with fallback responses to provide graceful degradation during partial outages.',
      },
      {
        id: 'arch_5',
        topic: 'Message Queues & Decoupling',
        question: 'What is the principal architectural advantage of using an asynchronous message broker (like RabbitMQ, Apache Kafka, or AWS SQS) between backend services?',
        options: [
          'Decoupling producer and consumer workloads, smoothing traffic spikes through queue buffering, and supporting horizontal consumer scaling',
          'Reducing network bandwidth by converting data to binary assembly',
          'Eliminating the need for logging in microservices',
          'Replacing relational databases completely',
        ],
        correctIndex: 0,
        explanation: 'Message queues buffer bursts of incoming work, allowing background worker nodes to consume tasks at an optimal rate without overwhelming database or downstream systems.',
        practiceTip: 'Use message queues for asynchronous tasks like email dispatch, report generation, and third-party webhooks.',
      },
    ],
  },
};

/**
 * Maps a skill string to an assessment domain ID
 */
export const getDomainForSkill = (skill: string): string | null => {
  const s = skill.toLowerCase().trim();
  if (s.includes('python') || s.includes('django') || s.includes('fastapi')) return 'python';
  if (s.includes('react') || s.includes('next') || s.includes('tailwind') || s.includes('redux')) return 'react';
  if (s.includes('javascript') || s.includes('typescript') || s.includes('es6')) return 'javascript';
  if (s.includes('sql') || s.includes('postgres') || s.includes('mysql') || s.includes('database')) return 'sql';
  if (s.includes('node') || s.includes('express') || s.includes('api') || s.includes('rest')) return 'nodejs';
  if (s.includes('java') || s.includes('spring')) return 'java';
  if (s.includes('docker') || s.includes('kubernetes') || s.includes('devops') || s.includes('ci/cd') || s.includes('linux') || s.includes('aws') || s.includes('terraform')) return 'devops';
  if (s.includes('pandas') || s.includes('data analysis') || s.includes('tableau') || s.includes('power bi') || s.includes('analytics')) return 'data_analysis';
  if (s.includes('algorithm') || s.includes('problem solving') || s.includes('data structures') || s.includes('coding')) return 'coding_problem_solving';
  if (s.includes('debugging') || s.includes('testing') || s.includes('qa')) return 'debugging';
  if (s.includes('architecture') || s.includes('system design') || s.includes('microservices')) return 'project_architecture';
  return null;
};

/**
 * Filter technical rounds relevant to a given role
 */
export const getRoundsForRole = (role: string): TechnicalRoundMode[] => {
  const r = role.toLowerCase();

  return TECHNICAL_ROUND_MODES.filter((mode) => {
    if (mode.applicableRoles.length === 0) return true;
    return mode.applicableRoles.some((appRole) => appRole.toLowerCase() === r || r.includes(appRole.toLowerCase()));
  }).map((mode) => {
    // Adapt domain to role
    let adaptedDomain = mode.domainId;
    if (mode.id === 'fundamentals') {
      if (r.includes('python')) adaptedDomain = 'python';
      else if (r.includes('java') && !r.includes('javascript')) adaptedDomain = 'java';
      else if (r.includes('devops') || r.includes('cloud')) adaptedDomain = 'devops';
      else if (r.includes('data analyst')) adaptedDomain = 'data_analysis';
      else adaptedDomain = 'javascript';
    } else if (mode.id === 'framework') {
      if (r.includes('backend') || r.includes('python')) adaptedDomain = 'nodejs';
      else if (r.includes('devops') || r.includes('cloud')) adaptedDomain = 'devops';
      else if (r.includes('data')) adaptedDomain = 'data_analysis';
      else adaptedDomain = 'react';
    }
    return {
      ...mode,
      domainId: adaptedDomain,
    };
  });
};

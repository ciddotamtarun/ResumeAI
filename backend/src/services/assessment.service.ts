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
  questions: Question[];
}

export const QUESTION_REGISTRY: Record<string, DomainAssessment> = {
  python: {
    id: 'python',
    name: 'Python Core & Architecture',
    description: 'Data structures, mutable defaults, decorators, generators, and async programming',
    badgeColor: '#4F46D8',
    category: 'Backend & Data',
    questions: [
      {
        id: 'py_1',
        topic: 'Mutable Defaults',
        question: 'What is the output of the following Python code snippet regarding mutable default arguments?',
        code: `def append_item(val, items=[]):\n    items.append(val)\n    return items\n\nprint(append_item(1))\nprint(append_item(2))`,
        options: ['[1] then [2]', '[1] then [1, 2]', '[1, 2] then [1, 2]', 'TypeError: mutable default forbidden'],
        correctIndex: 1,
        explanation: 'In Python, default arguments are evaluated only once when the function is defined. The list `items` is retained and shared across subsequent invocations.',
        practiceTip: 'Always use `items=None` and initialize inside the function (`if items is None: items = []`).',
      },
      {
        id: 'py_2',
        topic: 'Generators & Memory',
        question: 'What is the principal difference between a list comprehension and a generator expression?',
        code: `list_comp = [x * 2 for x in range(1000000)]\ngen_exp = (x * 2 for x in range(1000000))`,
        options: [
          'List comprehensions are lazy; generator expressions evaluate immediately',
          'List comprehension allocates memory for all elements upfront; generator expression yields items on demand using O(1) memory',
          'Generator expressions can be indexed with `gen_exp[0]`; lists cannot',
          'There is no difference in memory allocation',
        ],
        correctIndex: 1,
        explanation: 'Generator expressions return a generator iterator that computes values lazily on-the-fly, consuming constant memory regardless of stream size.',
        practiceTip: 'Use generator expressions for large file processing or pipeline operations.',
      },
      {
        id: 'py_3',
        topic: 'Decorators & Metadata',
        question: 'What is the primary function of `@functools.wraps(fn)` when writing a custom decorator?',
        options: [
          'It compiles the function to bytecode for faster execution',
          'It preserves original metadata like the docstring, function name, and signature',
          'It prevents recursion depth limits',
          'It automatically types the return arguments',
        ],
        correctIndex: 1,
        explanation: 'Without `@functools.wraps`, the decorated function would have its `__name__` and `__doc__` overwritten by the wrapper function.',
        practiceTip: 'Always decorate wrapper functions with `@wraps(fn)` to preserve debugging and introspection clarity.',
      },
      {
        id: 'py_4',
        topic: 'Asynchronous Concurrency',
        question: 'How does `asyncio.gather(*tasks, return_exceptions=True)` handle exceptions compared to `return_exceptions=False`?',
        options: [
          'It aborts all tasks immediately upon the first failure',
          'Exceptions are treated as return values in the results list, allowing other tasks to complete',
          'It automatically retries failed tasks up to 3 times',
          'It suppresses exceptions without returning anything',
        ],
        correctIndex: 1,
        explanation: 'With `return_exceptions=True`, errors are returned alongside successful results rather than cancelling the remaining awaited coroutines.',
        practiceTip: 'Use `return_exceptions=True` when orchestrating batch API requests where individual failures should not break the pipeline.',
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
        practiceTip: 'For CPU-bound tasks, utilize `multiprocessing` or native C-extensions; for I/O bound tasks, use `asyncio` or threading.',
      },
    ],
  },

  javascript: {
    id: 'javascript',
    name: 'JavaScript & TypeScript',
    description: 'Event loop mechanics, async/await, closures, prototypes, and TypeScript type systems',
    badgeColor: '#B7791F',
    category: 'Frontend & Full Stack',
    questions: [
      {
        id: 'js_1',
        topic: 'Event Loop & Microtasks',
        question: 'What is the exact execution output order of the following JavaScript snippet?',
        code: `console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');`,
        options: ['A, B, C, D', 'A, D, C, B', 'A, D, B, C', 'A, C, D, B'],
        correctIndex: 1,
        explanation: 'Synchronous code executes first (A, D). Microtasks (Promise.then) run immediately after synchronous execution before macrotasks (setTimeout), yielding A, D, C, B.',
        practiceTip: 'Understanding the microtask queue is critical for managing state updates and race conditions.',
      },
      {
        id: 'js_2',
        topic: 'Closures & Scope',
        question: 'What defines a JavaScript closure?',
        options: [
          'An immediately invoked function expression (IIFE)',
          'A function bundled with references to its surrounding lexical state (lexical environment)',
          'A method declared with the `private` keyword in ES2022',
          'A syntax error caused by an unclosed curly brace',
        ],
        correctIndex: 1,
        explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has returned.',
        practiceTip: 'Closures power factory functions, data encapsulation, and custom React hooks.',
      },
      {
        id: 'js_3',
        topic: 'TypeScript Type Narrowing',
        question: 'In TypeScript, what is the effect of the `unknown` type compared to `any`?',
        options: [
          '`unknown` is identical to `any`',
          '`unknown` requires type narrowing or assertion before operations can be performed on the value',
          '`unknown` allows all operations without compile-time type checks',
          '`unknown` can only hold primitive strings and numbers',
        ],
        correctIndex: 1,
        explanation: '`unknown` is the type-safe counterpart of `any`. Any value is assignable to `unknown`, but TypeScript disallows property access until narrowed.',
        practiceTip: 'Prefer `unknown` over `any` for API responses and third-party inputs.',
      },
      {
        id: 'js_4',
        topic: 'Object Cloning & References',
        question: 'What is the primary advantage of the native `structuredClone()` method over `JSON.parse(JSON.stringify(obj))`?',
        options: [
          '`structuredClone()` supports circular references, Dates, RegExps, Maps, Sets, and ArrayBuffers',
          '`structuredClone()` clones functions and prototype chains',
          '`structuredClone()` runs synchronously in a Web Worker',
          '`structuredClone()` works only on simple JSON objects',
        ],
        correctIndex: 0,
        explanation: '`structuredClone()` handles complex nested types and circular references that break `JSON.stringify()`.',
        practiceTip: 'Use `structuredClone(obj)` for reliable deep copying in modern web browsers and Node 17+.',
      },
      {
        id: 'js_5',
        topic: 'Lexical vs Dynamic This',
        question: 'How does arrow function syntax `() => {}` handle the `this` context compared to `function() {}`?',
        options: [
          'Arrow functions create their own dynamic `this` bound to the caller',
          'Arrow functions retain the lexical `this` of the enclosing execution context',
          'Arrow functions always bind `this` to `window` or `global`',
          'Arrow functions throw an error if `this` is accessed',
        ],
        correctIndex: 1,
        explanation: 'Arrow functions do not define their own `this`. They inherit `this` from the parent lexical scope.',
        practiceTip: 'Do not use arrow functions for object methods that need access to `this.propertyName`.',
      },
    ],
  },

  react: {
    id: 'react',
    name: 'React & Modern Frontend',
    description: 'Component lifecycles, custom hooks, memoization, state management, and rendering optimization',
    badgeColor: '#0EA5E9',
    category: 'Frontend & Full Stack',
    questions: [
      {
        id: 'react_1',
        topic: 'Hook Dependencies',
        question: 'In React, what occurs if an object or function created inside a component body is included in a `useEffect` dependency array without memoization?',
        options: [
          'The effect runs only once on initial mount',
          'The effect triggers on every render because a new reference is generated on each render cycle',
          'React throws a compile-time type error',
          'React automatically memoizes unmemoized functions',
        ],
        correctIndex: 1,
        explanation: 'In JavaScript, `{}` !== `{}` and functions have new references on every render. Without `useCallback` or `useMemo`, reference equality fails, re-running the effect.',
        practiceTip: 'Wrap callbacks passed into dependency arrays with `useCallback` or move them inside the effect.',
      },
      {
        id: 'react_2',
        topic: 'Render Optimization',
        question: 'What is the primary difference between `React.memo` and `useMemo`?',
        options: [
          '`React.memo` is a Higher-Order Component for memoizing component render outputs; `useMemo` memoizes computed values inside a component',
          '`React.memo` runs only on server components; `useMemo` runs on client components',
          '`React.memo` caches network requests; `useMemo` caches Redux states',
          'They are identical aliases introduced in React 18',
        ],
        correctIndex: 0,
        explanation: '`React.memo` prevents re-renders of a component when props haven’t changed. `useMemo` caches the return value of an expensive calculation between renders.',
        practiceTip: 'Use `React.memo` on pure presentation components that receive stable props in frequently updating parents.',
      },
      {
        id: 'react_3',
        topic: 'Custom Hooks',
        question: 'Which of the following violates the Rules of Hooks in React?',
        options: [
          'Calling a custom hook inside another custom hook',
          'Calling `useState` conditionally inside an `if` statement block',
          'Calling `useEffect` at the top level of a functional component',
          'Passing a state setter callback to a child component',
        ],
        correctIndex: 1,
        explanation: 'Hooks must always be called at the top level of React functions, before any early returns or conditional blocks, to preserve call order consistency.',
        practiceTip: 'Place conditions inside the hook body rather than wrapping the hook call with a condition.',
      },
      {
        id: 'react_4',
        topic: 'State Batching',
        question: 'How does React 18 handle automatic state batching across asynchronous boundaries (e.g. inside `setTimeout` or `fetch`)?',
        options: [
          'It batches multiple state updates together into a single re-render automatically',
          'It forces immediate synchronous rendering for every state setter inside promises',
          'It throws a warning unless wrapped in `ReactDOM.flushSync`',
          'Automatic batching only applies to class components',
        ],
        correctIndex: 0,
        explanation: 'React 18 introduced automatic batching for all updates, including promises, timeouts, and native event handlers, improving rendering performance.',
        practiceTip: 'If you ever need an immediate DOM update before the next line of code, opt-out with `flushSync()`.',
      },
      {
        id: 'react_5',
        topic: 'Keys in Lists',
        question: 'Why should array indices generally be avoided as `key` props for dynamically reordered lists?',
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

  sql: {
    id: 'sql',
    name: 'SQL & Database Architecture',
    description: 'Complex joins, window functions, indexing strategies, and transaction isolation',
    badgeColor: '#168575',
    category: 'Database & Data',
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
        practiceTip: 'To find records missing in the right table, use `LEFT JOIN ... WHERE right_table.id IS NULL`.',
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
        question: 'What is the key difference between `RANK()` and `DENSE_RANK()` window functions when duplicate values occur?',
        options: [
          'RANK() skips subsequent rank numbers after ties (e.g. 1, 2, 2, 4); DENSE_RANK() does not skip (e.g. 1, 2, 2, 3)',
          'DENSE_RANK() sorts descending while RANK() sorts ascending',
          'RANK() requires an aggregation clause; DENSE_RANK() operates on unindexed tables only',
          'They are identical aliases in ANSI SQL',
        ],
        correctIndex: 0,
        explanation: '`RANK()` creates gaps in numbering after ties, whereas `DENSE_RANK()` assigns contiguous consecutive integers.',
        practiceTip: 'Use `DENSE_RANK()` when you need top N distinct tiers without number gaps.',
      },
      {
        id: 'sql_4',
        topic: 'Index Selection & Leftmost Prefix',
        question: 'Given a composite B-Tree index on `(department_id, salary)`, which of the following queries CANNOT efficiently utilize the index?',
        options: [
          '`WHERE department_id = 5 AND salary > 80000`',
          '`WHERE department_id = 5`',
          '`WHERE salary > 80000` (without department_id specified)',
          '`WHERE department_id IN (1, 2, 3) ORDER BY salary`',
        ],
        correctIndex: 2,
        explanation: 'B-Tree indexes follow the leftmost prefix rule. An index on `(A, B)` cannot be used for filtering solely on `B` without `A`.',
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
        practiceTip: 'For financial ledgers requiring total isolation, specify `SERIALIZABLE` or optimistic row locking.',
      },
    ],
  },

  nodejs: {
    id: 'nodejs',
    name: 'Node.js & Backend Architecture',
    description: 'Event-driven I/O, streams, REST API standards, middleware, and authentication',
    badgeColor: '#15803D',
    category: 'Backend & Full Stack',
    questions: [
      {
        id: 'node_1',
        topic: 'Streams vs Buffers',
        question: 'Why should large file downloads in Node.js be served using `fs.createReadStream().pipe(res)` instead of `fs.readFile()`?',
        options: [
          '`createReadStream` streams data in chunks without buffering the whole file in RAM, avoiding high memory spikes',
          '`createReadStream` automatically compresses files with gzip',
          '`fs.readFile()` cannot read binary files',
          'Node.js disallows `fs.readFile()` in HTTP responses',
        ],
        correctIndex: 0,
        explanation: 'Streams process data piece by piece (typically 64KB chunks), preventing memory exhaustion when handling concurrent large file transfers.',
        practiceTip: 'Always use stream pipelines with error handling (`stream.pipeline`) for file operations and API proxies.',
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
          '`(err, req, res, next)` — exactly 4 arguments',
          '`(req, res, err)` — exactly 3 arguments',
          '`(err, res)` — 2 arguments',
          '`async (error) => {}`',
        ],
        correctIndex: 0,
        explanation: 'Express inspects function arity (`fn.length`). Only middleware with 4 arguments `(err, req, res, next)` are invoked as error handlers.',
        practiceTip: 'Always place your 4-argument error handler at the very end of your middleware stack after all route definitions.',
      },
      {
        id: 'node_4',
        topic: 'JWT Security',
        question: 'Where should sensitive JWT access tokens ideally be stored in a web browser to mitigate Cross-Site Scripting (XSS) token theft?',
        options: [
          'In an `HttpOnly`, `Secure`, `SameSite` cookie',
          'In browser `localStorage`',
          'In the browser URL query parameters',
          'In `sessionStorage` with a base64 encoding',
        ],
        correctIndex: 0,
        explanation: '`HttpOnly` cookies cannot be accessed by client-side JavaScript, protecting tokens from being stolen if an XSS vulnerability exists.',
        practiceTip: 'Pair `HttpOnly` cookies with CSRF tokens or `SameSite=Strict` policies to defend against both XSS and CSRF.',
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
        practiceTip: 'Always register `process.on("unhandledRejection")` and wrap async express route handlers in try/catch or async wrappers.',
      },
    ],
  },

  java: {
    id: 'java',
    name: 'Java & Enterprise Architecture',
    description: 'OOP, Collections framework, concurrency, JVM memory model, and Spring ecosystem',
    badgeColor: '#C2410C',
    category: 'Backend & Enterprise',
    questions: [
      {
        id: 'java_1',
        topic: 'Collections & HashCode',
        question: 'In Java, what is the contract between `equals()` and `hashCode()` for objects used as keys in a `HashMap`?',
        options: [
          'If two objects are equal via `equals()`, they MUST produce the exact same `hashCode()`',
          'If two objects have the same `hashCode()`, they must always be equal via `equals()`',
          '`hashCode()` is only used for sorting and has no relation to `equals()`',
          'Java automatically calculates hash codes and overrides are ignored',
        ],
        correctIndex: 0,
        explanation: 'Equal objects must have equal hash codes to ensure they hash to the same bucket in hash-based collections. The inverse is not required (hash collisions can happen).',
        practiceTip: 'Always override `hashCode()` whenever you override `equals()`. Use `Objects.hash()` or Lombok `@EqualsAndHashCode`.',
      },
      {
        id: 'java_2',
        topic: 'Concurrency & Volatile',
        question: 'What does the `volatile` keyword guarantee when applied to a variable in Java?',
        options: [
          'Visibility of writes across threads and prevents instruction reordering around that variable',
          'Atomic increment operations (like `count++`) without locks',
          'Thread-safe synchronization of code blocks',
          'Immutable heap allocation in the Young Generation',
        ],
        correctIndex: 0,
        explanation: '`volatile` ensures that reads and writes go directly to main memory rather than thread CPU caches, establishing a happens-before relationship.',
        practiceTip: 'Use `AtomicInteger` for thread-safe counters; use `volatile` for boolean status flags.',
      },
      {
        id: 'java_3',
        topic: 'JVM Garbage Collection',
        question: 'In the HotSpot JVM memory structure, which generation is primarily responsible for short-lived, newly allocated objects?',
        options: ['Eden space in the Young Generation', 'Tenured / Old Generation', 'Metaspace', 'Code Cache'],
        correctIndex: 0,
        explanation: 'Objects are initially allocated in the Eden space. Surviving objects move between Survivor spaces (S0/S1) before being promoted to the Old Generation.',
        practiceTip: 'Tune `-Xmn` or sizing parameters to minimize premature promotion of short-lived objects to Tenured space.',
      },
      {
        id: 'java_4',
        topic: 'Interfaces & Default Methods',
        question: 'Since Java 8, how can an interface provide method implementations without breaking existing implementers?',
        options: [
          'Using the `default` keyword in the interface method signature',
          'Declaring the method as `abstract static`',
          'Implementing the method inside an inner class',
          'Using the `final` keyword in the interface',
        ],
        correctIndex: 0,
        explanation: '`default` methods allow library authors to add new methods to interfaces while preserving backward compatibility for existing implementations.',
        practiceTip: 'Use default methods to provide optional convenience methods in API contracts.',
      },
      {
        id: 'java_5',
        topic: 'Exception Hierarchy',
        question: 'What is the principal difference between a Checked Exception and an Unchecked Exception in Java?',
        options: [
          'Checked exceptions inherit from `Exception` (excluding `RuntimeException`) and must be handled or declared in the `throws` clause; Unchecked exceptions inherit from `RuntimeException`',
          'Unchecked exceptions terminate the JVM immediately; checked exceptions do not',
          'Checked exceptions can only be thrown by native C code',
          'There is no difference in compiler enforcement',
        ],
        correctIndex: 0,
        explanation: 'Checked exceptions are verified at compile-time by the Java compiler, enforcing explicit recovery strategies for expected failure scenarios.',
        practiceTip: 'Use checked exceptions for recoverable business conditions (e.g., FileNotFound) and unchecked exceptions for programming errors (e.g., NullPointerException).',
      },
    ],
  },

  devops: {
    id: 'devops',
    name: 'DevOps & Cloud Infrastructure',
    description: 'Docker, Kubernetes, CI/CD automation, Linux internals, and cloud governance',
    badgeColor: '#D97706',
    category: 'DevOps & Cloud',
    questions: [
      {
        id: 'devops_1',
        topic: 'Docker Image Optimization',
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
        practiceTip: 'Use `ClusterIP` for internal microservice communication and `Ingress` for external HTTP/HTTPS routing.',
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
        question: 'When `docker stop` or `kubectl delete pod` is invoked, which POSIX signal is sent first to allow graceful container termination before `SIGKILL`?',
        options: ['SIGTERM (Signal 15)', 'SIGINT (Signal 2)', 'SIGSTOP (Signal 19)', 'SIGHUP (Signal 1)'],
        correctIndex: 0,
        explanation: 'Containers receive `SIGTERM` first, allowing the application a grace period (default 30 seconds) to close active database connections and complete inflight HTTP requests before `SIGKILL`.',
        practiceTip: 'Handle `process.on("SIGTERM")` in your application servers to gracefully drain connections.',
      },
      {
        id: 'devops_5',
        topic: 'Infrastructure as Code (IaC)',
        question: 'In Terraform, what is the purpose of the state file (`terraform.tfstate`)?',
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

  data_analysis: {
    id: 'data_analysis',
    name: 'Data Analysis & Business Intelligence',
    description: 'Pandas dataframes, data cleaning, aggregation, statistical significance, and visualization',
    badgeColor: '#6366F1',
    category: 'Data & Analytics',
    questions: [
      {
        id: 'da_1',
        topic: 'Pandas Missing Values',
        question: 'In Python Pandas, what is the difference between `df.dropna()` and `df.fillna(value)`?',
        options: [
          '`df.dropna()` removes rows or columns containing NaN values; `df.fillna()` replaces NaN entries with a specified value',
          '`df.dropna()` replaces NaN with 0; `df.fillna()` removes missing columns',
          '`df.dropna()` deletes the entire dataframe if any null exists',
          'They perform the same operation',
        ],
        correctIndex: 0,
        explanation: '`dropna()` drops records with missing data, while `fillna()` imputes missing entries with constants or aggregations like mean/median.',
        practiceTip: 'Check missing data distribution with `df.isnull().sum()` before deciding whether to drop or impute.',
      },
      {
        id: 'da_2',
        topic: 'Correlation vs Causation',
        question: 'If two variables have a Pearson correlation coefficient of r = 0.92, what can be definitively concluded?',
        options: [
          'A strong positive linear relationship exists between the two variables',
          'Variable A causes Variable B to increase',
          'Variable B causes Variable A to increase',
          'There are no outliers in either dataset',
        ],
        correctIndex: 0,
        explanation: 'Pearson correlation measures the strength and direction of linear association, but correlation alone never implies a causal relationship.',
        practiceTip: 'Always visualize scatter plots and consider confounding third variables when interpreting high correlation.',
      },
      {
        id: 'da_3',
        topic: 'A/B Testing & P-Values',
        question: 'In statistical hypothesis testing for an A/B experiment, what does a p-value of 0.03 indicate when the significance threshold is α = 0.05?',
        options: [
          'The result is statistically significant, and we reject the null hypothesis',
          'The result is not significant, and we fail to reject the null hypothesis',
          'There is a 97% certainty that the test failed',
          'The sample size was too small',
        ],
        correctIndex: 0,
        explanation: 'Because p (0.03) < α (0.05), the observed difference between variant A and B is unlikely to have occurred by random chance under the null hypothesis.',
        practiceTip: 'Ensure adequate statistical power and sample size before concluding an A/B test.',
      },
      {
        id: 'da_4',
        topic: 'SQL Window Ranking for Business',
        question: 'Which SQL window clause correctly calculates a running cumulative total of revenue by date?',
        options: [
          '`SUM(revenue) OVER (ORDER BY transaction_date)`',
          '`AVG(revenue) OVER (PARTITION BY transaction_date)`',
          '`COUNT(revenue) OVER ()`',
          '`ROW_NUMBER() OVER (ORDER BY revenue)`',
        ],
        correctIndex: 0,
        explanation: '`SUM(...) OVER (ORDER BY ...)` defaults to cumulative framing (`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`), yielding running totals.',
        practiceTip: 'Use running totals in cohort analysis to track customer lifetime value over time.',
      },
      {
        id: 'da_5',
        topic: 'Data Reshaping',
        question: 'What is the function of `pd.melt()` in Pandas compared to `df.pivot()`?',
        options: [
          '`pd.melt()` unpivots a DataFrame from wide format to long format; `df.pivot()` reshapes from long to wide format',
          '`pd.melt()` converts integers to floats',
          '`pd.melt()` deletes duplicate rows',
          'They are identical operations',
        ],
        correctIndex: 0,
        explanation: '`melt` transforms columns into key-value pairs (wide to long), which is often required for tidy data visualization in seaborn or ggplot.',
        practiceTip: 'Use `pd.melt()` when preparing multi-column survey or timeline data for charting.',
      },
    ],
  },
};

export interface AssessmentResultScore {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  topicBreakdown: Array<{ topic: string; score: number; total: number }>;
  weakTopics: string[];
  recommendations: string[];
}

export const scoreAssessmentSubmission = (
  assessmentId: string,
  userAnswers: Record<string | number, number>,
  timeSpentSeconds: number = 0
): AssessmentResultScore => {
  const domain = QUESTION_REGISTRY[assessmentId] || QUESTION_REGISTRY['javascript'];
  const questions = domain.questions;

  let correctCount = 0;
  const topicMap: Record<string, { correct: number; total: number }> = {};
  const weakTopics: string[] = [];

  questions.forEach((q, idx) => {
    const userChoice = userAnswers[idx] !== undefined ? userAnswers[idx] : userAnswers[q.id];
    const isCorrect = userChoice === q.correctIndex;

    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { correct: 0, total: 0 };
    }
    topicMap[q.topic].total += 1;

    if (isCorrect) {
      correctCount += 1;
      topicMap[q.topic].correct += 1;
    } else {
      if (!weakTopics.includes(q.topic)) {
        weakTopics.push(q.topic);
      }
    }
  });

  const finalScore = Math.round((correctCount / questions.length) * 100);
  const passed = finalScore >= 70;

  const topicBreakdown = Object.entries(topicMap).map(([topic, stat]) => ({
    topic,
    score: Math.round((stat.correct / stat.total) * 100),
    total: stat.total,
  }));

  const recommendations: string[] = [];
  if (weakTopics.length > 0) {
    weakTopics.slice(0, 3).forEach((topic) => {
      recommendations.push(`Targeted Review: Strengthen understanding of ${topic} through focused exercises.`);
    });
  } else {
    recommendations.push(`Excellent demonstration of ${domain.name}! Ready for senior interview technical rounds.`);
  }

  return {
    score: finalScore,
    passed,
    totalQuestions: questions.length,
    correctCount,
    timeSpentSeconds,
    topicBreakdown,
    weakTopics,
    recommendations,
  };
};

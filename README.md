# Protocol Adapter

Universal protocol adaptation system

## Goal
Create a universal adapter system capable of transforming and connecting any protocol to any other protocol, enabling seamless interoperability between different systems and standards.

## Features
- **Universal Protocol Transformation** - adapt between arbitrary protocols.
- **Adapter Chains** - compose multiple adapters to bridge complex gaps.
- **Example Implementations** - HTTP ↔ gRPC and JSON ↔ XML conversions.

## Getting Started
1. Install dependencies with `npm install`.
2. Run the TypeScript build with `npm run build`.
3. Execute tests using `npm test`.

## Usage
Adapters are registered with the `AdapterRegistry` and resolved based on the
source and target protocols. A short example:

```ts
import { AdapterRegistry } from './src/core/adapter';
import { HttpToGrpcAdapter } from './src/implementations/http-grpc.adapter';

const registry = new AdapterRegistry();
registry.register(new HttpToGrpcAdapter());

const adapter = registry.findAdapter(
  { name: 'HTTP', version: '1.1', capabilities: [], metadata: {} },
  { name: 'gRPC', version: '1.0', capabilities: [], metadata: {} }
);

const grpcReq = await adapter?.adapt({ method: 'GET', path: '/users', body: {} });
```

See `src/examples/adapter.test.ts` for additional demonstrations.

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to
extend functionality or improve documentation.

## License
This project is licensed under the MIT License.

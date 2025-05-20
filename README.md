# Protocol Adapter

Concept - Work in progress...

## Goal
Create a universal adapter system capable of transforming and connecting any protocol to any other protocol, enabling seamless interoperability between different systems and standards.

## Available Adapters
- **HTTP to gRPC** – convert RESTful HTTP requests into gRPC calls.
- **gRPC to JSON** – decode gRPC messages into JSON objects.
- **JSON to XML** – serialize JSON structures into XML and back.
- **CSV to JSON** – parse CSV data into JSON arrays and generate CSV.

These adapters can be combined using the `AdapterRegistry` and `AdapterChain` utilities to create complex protocol transformations.

FROM rust:1.80 as builder
WORKDIR /app
COPY . .

RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/capstone-be /app/server

EXPOSE 3000

CMD ["/app/server"]

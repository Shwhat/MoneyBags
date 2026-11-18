# MoneyBags server image for amd64 and arm64.
# The Go build runs on the build machine's own architecture and cross-compiles, so multi-arch builds are fast:
#   docker buildx build --platform linux/amd64,linux/arm64 -t moneybags:latest .
FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS build
ARG TARGETOS=linux
ARG TARGETARCH
WORKDIR /src
COPY go.mod ./
COPY *.go ./
COPY ui ./ui
COPY web ./web
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -trimpath -ldflags "-s -w" -o /out/moneybags . \
 && mkdir -p /out/data

# The server is one static binary, so the image holds nothing else.
FROM scratch
COPY --from=build /out/moneybags /moneybags
COPY --from=build --chown=65532:65532 /out/data /data
ENV MONEYBAGS_DATA=/data \
    MONEYBAGS_ADDR=:8080
VOLUME ["/data"]
EXPOSE 8080
USER 65532:65532
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["/moneybags", "-healthcheck"]
ENTRYPOINT ["/moneybags"]

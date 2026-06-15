FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/Marketplace.Api/Marketplace.Api.csproj", "src/Marketplace.Api/"]
COPY ["src/Marketplace.Application/Marketplace.Application.csproj", "src/Marketplace.Application/"]
COPY ["src/Marketplace.Domain/Marketplace.Domain.csproj", "src/Marketplace.Domain/"]
COPY ["src/Marketplace.Infrastructure/Marketplace.Infrastructure.csproj", "src/Marketplace.Infrastructure/"]
RUN dotnet restore "src/Marketplace.Api/Marketplace.Api.csproj"

COPY . .
RUN dotnet publish "src/Marketplace.Api/Marketplace.Api.csproj" \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app/wwwroot/uploads

COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "Marketplace.Api.dll"]

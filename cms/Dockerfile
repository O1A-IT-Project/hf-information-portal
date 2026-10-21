FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore "HFPortal.csproj"

RUN dotnet publish "HFPortal.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8443

ENTRYPOINT ["dotnet", "HFPortal.dll"]

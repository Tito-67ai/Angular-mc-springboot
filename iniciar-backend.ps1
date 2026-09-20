# ============================================================
#  Inicia todo el backend de microservicios desde la raiz del
#  proyecto. Al ejecutarse desde aqui, las banderas jdbc:h2:file:./data/*
#  apuntan a la carpeta data\ de la raiz (bases H2 reutilizables).
# ============================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$servicios = @(
    @{ nombre = 'registry';        jar = 'registry-0.0.1-SNAPSHOT.jar' },
    @{ nombre = 'config-server';   jar = 'config-server-0.0.1-SNAPSHOT.jar' },
    @{ nombre = 'alumnos';         jar = 'alumnos-0.0.1-SNAPSHOT.jar' },
    @{ nombre = 'administracion';  jar = 'administracion-0.0.1-SNAPSHOT.jar' },
    @{ nombre = 'gateway';         jar = 'gateway-0.0.1-SNAPSHOT.jar' },
    @{ nombre = 'admin-server';    jar = 'admin-server-0.0.1-SNAPSHOT.jar' }
)

$logDir = Join-Path $root 'backend\logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

Write-Host "Levantando backend. Requiere RabbitMQ activo:  docker compose up -d" -ForegroundColor Yellow

foreach ($s in $servicios) {
    $jarPath = Join-Path $root "backend\$($s.nombre)\target\$($s.jar)"
    if (-not (Test-Path $jarPath)) {
        Write-Warning "No se encontro el jar de $($s.nombre). Ejecuta:  backend\$($s.nombre)\mvnw.cmd package -DskipTests"
        continue
    }
    Start-Process java -ArgumentList "-jar", $jarPath -WorkingDirectory $root `
        -RedirectStandardOutput (Join-Path $logDir "$($s.nombre).log") `
        -RedirectStandardError  (Join-Path $logDir "$($s.nombre).err") `
        -WindowStyle Hidden
    Write-Host "  -> $($s.nombre) iniciado" -ForegroundColor Green
}

Write-Host ""
Write-Host "URLs:"
Write-Host "  Eureka (Registry):  http://localhost:8761"
Write-Host "  Config Server:      http://localhost:8888" 
Write-Host "  API Gateway:        http://localhost:8080"
Write-Host "  Alumnos directo:    http://localhost:8101/api/alumnos"
Write-Host "  RabbitMQ UI:        http://localhost:15672  (guest/guest)"
Write-Host "  Spring Boot Admin:  http://localhost:9090"
Write-Host "Logs en: backend\logs"
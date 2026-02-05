# SKRYPT URUCHAMIANIA NEO4J
# GOK:AI Protocol: Automatyczne uruchomienie Neo4j w Docker

$dockerPath = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  URUCHAMIANIE NEO4J - GOK:AI Protocol" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Sprawdz czy Docker Engine dziala
Write-Host "Sprawdzanie statusu Docker Engine..." -ForegroundColor Yellow
$retries = 0
$maxRetries = 10

while ($retries -lt $maxRetries) {
    try {
        & $dockerPath ps | Out-Null
        Write-Host "[OK] Docker Engine dziala" -ForegroundColor Green
        break
    }
    catch {
        $retries++
        Write-Host "Oczekiwanie na Docker Engine... ($retries/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if ($retries -eq $maxRetries) {
    Write-Host "[ERROR] Docker Engine nie odpowiada. Uruchom Docker Desktop recznie." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Sprawdz czy kontener juz istnieje
Write-Host "Sprawdzanie istniejacych kontenerow Neo4j..." -ForegroundColor Yellow
$existing = & $dockerPath ps -a --filter "name=neo4j-mta" --format "{{.Names}}"

if ($existing -eq "neo4j-mta") {
    Write-Host "Kontener neo4j-mta juz istnieje. Usuwanie..." -ForegroundColor Yellow
    & $dockerPath rm -f neo4j-mta
}

Write-Host ""

# Uruchom Neo4j
Write-Host "Uruchamianie kontenera Neo4j..." -ForegroundColor Yellow
Write-Host "  Nazwa: neo4j-mta" -ForegroundColor Gray
Write-Host "  Port HTTP: 7474" -ForegroundColor Gray
Write-Host "  Port Bolt: 7687" -ForegroundColor Gray
Write-Host "  Haslo: mtaquest2026" -ForegroundColor Gray
Write-Host ""

$containerId = & $dockerPath run -d --name neo4j-mta -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/mtaquest2026 neo4j:5.13

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Kontener utworzony: $containerId" -ForegroundColor Green
    Write-Host ""
    
    # Czekaj na inicjalizacje
    Write-Host "Oczekiwanie na inicjalizacje Neo4j..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Sprawdz status
    $status = & $dockerPath ps --filter "name=neo4j-mta" --format "{{.Status}}"
    Write-Host "Status kontenera: $status" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  [SUCCESS] NEO4J URUCHOMIONY" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Dostep:" -ForegroundColor Yellow
    Write-Host "   Neo4j Browser: http://localhost:7474" -ForegroundColor White
    Write-Host "   Bolt: bolt://localhost:7687" -ForegroundColor White
    Write-Host ""
    Write-Host "Dane uwierzytelniajace:" -ForegroundColor Yellow
    Write-Host "   Uzytkownik: neo4j" -ForegroundColor White
    Write-Host "   Haslo: mtaquest2026" -ForegroundColor White
    Write-Host ""
    Write-Host "Nastepne kroki:" -ForegroundColor Yellow
    Write-Host "   1. Otworz http://localhost:7474 w przegladarce" -ForegroundColor White
    Write-Host "   2. Zaloguj sie (neo4j / mtaquest2026)" -ForegroundColor White
    Write-Host "   3. Uruchom: python MTA_CORE_GRAPH\scripts\import_nodes_direct.py" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "[ERROR] Blad uruchamiania kontenera" -ForegroundColor Red
    exit 1
}

<?php
$reportsFile = fopen("reports.txt", "r") or die("Unable to open reports file");
$lines = array();

while (!feof($reportsFile)) {
    $line = trim(fgets($reportsFile));
    if (empty($line)) continue;
    $line = explode(" ", $line);
    if (count($line) == 0) continue;
    $lines[] = $line;
}

fclose($reportsFile);

function isValid($numbers) {
    if (count($numbers) < 2) return true;

    $isAscending = true;
    $isDescending = true;

    for ($i = 0; $i < count($numbers) - 1; $i++) {
        $diff = $numbers[$i + 1] - $numbers[$i];
        if ($diff <= 0 || $diff > 3) $isAscending = false;
        if ($diff >= 0 || -$diff > 3) $isDescending = false;
        if (!$isAscending && !$isDescending) return false;
    }

    return $isAscending || $isDescending;
}

$validReports = 0;

foreach ($lines as $line) {
    if (isValid($line)) {
        $validReports++;
        continue;
    }

    for ($i = 0; $i < count($line); $i++) {
        $newSeq = array_merge(
            array_slice($line, 0, $i),
            array_slice($line, $i + 1)
        );

        if (isValid($newSeq)) {
            $validReports++;
            break;
        }
    }
}

echo $validReports;
?>


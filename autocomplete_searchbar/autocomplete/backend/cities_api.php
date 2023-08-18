<?php

if (empty($_GET['query'])) {
    // NO DATA SENT
    http_response_code(400);
    exit; 
}

// IMPORT CITIES FILE AND TURN IT BACK INTO AN ARRAY
$cities = unserialize(file_get_contents("./cities_list_serialized.txt"));
sort($cities);

$matches = []; // STORE THE CITIES THAT MATCH THE QUERY
foreach($cities as $city) {
    if (stripos($city,  $_GET['query']) === 0) {
        // CITY STARTS WITH QUERY STRING, PUT IN MATCHES ARRAY
        $matches[] = $city;
    }
}

if (count($matches) > 0) {
    // RETURN THE MATCHES AS A STRING WITH "|" AS SEPARATOR
    http_response_code(200);
    echo implode("|", $matches);
}

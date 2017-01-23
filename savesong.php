<?php

$phpsong = $_POST['phpsong'];
$fname = "song.js";
$file = fopen("song/" .$fname, 'w');//creates new file
fwrite($file, $phpsong);
fclose($file);
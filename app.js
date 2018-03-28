var app = (function()
{
	// Application object.
	var app = {};

	// Dictionary of beacons.
	var beacons = {};

	var hitpoints = 100;
	var suitpoints = 100;
	var radpoints = 0;
	var psipoints = 0;

	// Timer that displays list of beacons.
	var updateTimer = null;
	app.initialize = function()
	{
		document.addEventListener(
			'deviceready',
			function() { evothings.scriptsLoaded(onDeviceReady) },
			false);
	};

	function onDeviceReady()
	{
		// Start tracking beacons!
		setTimeout(startScan, 500);
		console.log(navigator.notification);
		console.log(navigator.vibrate);
		// Display refresh timer.
		updateTimer = setInterval(displayBeaconList, 500);
	}

	function startScan()
	{
		// Called continuously when ranging beacons.
		evothings.eddystone.startScan(
			function(beacon)
			{
				// Insert/update beacon table entry.
				beacon.timeStamp = Date.now();
				beacons[beacon.address] = beacon;
			},
			function(error)
			{
				console.log('Eddystone Scan error: ' + JSON.stringify(error));
			});
	}

	/**
	 * Map the RSSI value to a value between 1 and 100.
	 */
	function mapBeaconRSSI(rssi)
	{
		if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
		if (rssi < -100) return 0; // Max RSSI
		return 100 + rssi;
	}

	function getSortedBeaconList(beacons)
	{
		var beaconList = [];
		for (var key in beacons)
		{
			beaconList.push(beacons[key]);
		}
		beaconList.sort(function(beacon1, beacon2)
		{
			return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
		});
		return beaconList;
	}

	

	function displayBeaconList()
	{
		// Clear beacon display list.
		$('#found-beacons').empty();

		// Update beacon display list.
		var timeNow = Date.now();
		$.each(getSortedBeaconList(beacons), function(index, beacon)
		{
			// Only show beacons that are updated during the last 10 seconds.
			if (beacon.timeStamp + 10000 > timeNow)
			{
				// Create HTML to display beacon data.
				var element = $(
					'<li>'
					+	htmlBeaconName(beacon)
					+	htmlBeaconRSSIBar(beacon)
					+   htmlBeaconAccuracy(beacon)

					+ '</li>'
				);


				$('#message').remove();
				$('#found-beacons').append(element);
				if (beacon.name == "RADIATION" && beacon.rssi > -74)
			{
				radpoints++;
				document.getElementById("radBeacons").innerHTML = radpoints;
				navigator.notification.beep(1);
			}
			else if (beacon.name == "ARTIFACT" && beacon.rssi > -90)
			{
				psipoints++;
				document.getElementById("psiBeacons").innerHTML = psipoints;
				navigator.vibrate(500);
			}
			}
			
		});
	}

	document.getElementById("radBeacons").innerHTML = radpoints;
	document.getElementById("psiBeacons").innerHTML = psipoints;
	document.getElementById("hitBeacons").innerHTML = hitpoints;
	document.getElementById("suitBeacons").innerHTML = suitpoints;

	function displaystats()
	{
//		document.getElementById("hitBeacons").innerHTML = hitpoints;
//		document.getElementById("suitBeacons").innerHTML = suitpoints;
	}

	function htmlBeaconAccuracy(beacon)
		{var distance = evothings.eddystone.calculateAccuracy(
			beacon.txPower, beacon.rssi);
			return distance ?
				'Distance: ' + distance + '<br/>' :  '';
		}

	function htmlBeaconName(beacon)
	{
		return beacon.name ?
			'<strong>' + beacon.name + '</strong><br/>' :  '';
	}

	function htmlBeaconURL(beacon)
	{
		return beacon.url ?
			'URL: ' + beacon.url + '<br/>' :  '';
	}

	function htmlBeaconNID(beacon)
	{
		return beacon.nid ?
			'NID: ' + uint8ArrayToString(beacon.nid) + '<br/>' :  '';
	}

	function htmlBeaconBID(beacon)
	{
		return beacon.bid ?
			'BID: ' + uint8ArrayToString(beacon.bid) + '<br/>' :  '';
	}

	function htmlBeaconVoltage(beacon)
	{
		return beacon.voltage ?
			'Voltage: ' + beacon.voltage + '<br/>' :  '';
	}

	function htmlBeaconTemperature(beacon)
	{
		return beacon.temperature && beacon.temperature != 0x8000 ?
			'Temperature: ' + beacon.temperature + '<br/>' :  '';
	}
	function htmlBeaconTxPower(beacon)
	{
		return beacon.txPower ?
			'TxPower: ' + beacon.txPower + '<br/>' :  '';
	}

	function htmlBeaconAdvCnt(beacon)
	{
		return beacon.adv_cnt ?
			'ADV_CNT: ' + beacon.adv_cnt + '<br/>' :  '';
	}

	function htmlBeaconDsecCnt(beacon)
	{
		return beacon.dsec_cnt ?
			'DSEC_CNT: ' + beacon.dsec_cnt + '<br/>' :  '';
	}

	function htmlBeaconRSSI(beacon)
	{
		return beacon.rssi ?
			'RSSI: ' + beacon.rssi + '<br/>' :  '';
	}

	function htmlBeaconRSSIBar(beacon)
	{
		return beacon.rssi ?
			'<div style="background:rgb(112,130,56);height:20px;width:'
				+ mapBeaconRSSI(beacon.rssi) + '%;"></div>' : '';
	}

	function uint8ArrayToString(uint8Array)
	{
		function format(x)
		{
			var hex = x.toString(16);
			return hex.length < 2 ? '0' + hex : hex;
		}

		var result = '';
		for (var i = 0; i < uint8Array.length; ++i)
		{
			result += format(uint8Array[i]) + ' ';
		}
		return result;
	}

	return app;
})();

app.initialize();


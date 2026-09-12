# Cloud-Poll Thermal Printing

How online orders become paper kitchen tickets with no print server, no
firewall changes, and (often) no new hardware.

## The pattern

Instead of pushing print jobs *into* the restaurant network (static IPs,
port forwarding, a PC acting as print server), the printer polls an HTTPS
endpoint on our backend every few seconds: *"anything to print?"* The
server replies with the ticket markup, the printer prints, reports status.
The iPad never prints directly — tickets survive it being asleep, and
there is no Bluetooth pairing or mixed-content fight.

This dovetails with an order pipeline that already queues work: confirming
an order enqueues a print job next to the SMS/email jobs, with the same
dedup keys and retries.

## The two vendors that support it

- **Star CloudPRNT** — TSP100IV/TSP143IV LAN (~$250–309), mC-Print3.
  Printer POST-polls your endpoint; documented protocol, no SaaS fee
  (you host the endpoint, ~$0 incremental).
- **Epson Server Direct Print** — TM-T88 series, TM-T20III, TM-m30II/m50
  and most networked TM printers. Same shape: printer polls, pulls
  ePOS-Print XML, prints. Configured from the printer's web utility;
  no new hardware when the kitchen already has one.

## The $0 question

Ask what printer is already in the kitchen. A networked Epson TM-T88 or
TM-T20 supports Server Direct Print today — point it at the endpoint
during onboarding and printing costs nothing. Otherwise budget ~$250 for
a Star TSP100IV LAN.

## Caveats

- Thermal paper darkens under sustained grill heat, steam, and grease.
  For tickets that live by the wok or under heat lamps, an impact
  printer (Star SP700/SP742, ~$250–400 Ethernet) stays readable where
  thermal goes black. Decide on site survey; most expo/pass lines are
  fine on thermal.
- iOS Safari/PWAs cannot reach printers over USB/Bluetooth (no WebUSB),
  which is exactly why the cloud-poll path — not direct browser
  printing — is the recommended architecture.
- 80mm paper is the restaurant standard; don't buy 58mm.

## Links

- Star CloudPRNT protocol:
  https://star-m.jp/products/s_print/sdk/StarCloudPRNT/manual/en/protocol-guide.html
- Epson ePOS-Print / Server Direct Print:
  https://download4.epson.biz/sec_pubs/pos/reference_en/epos_print/
- Star WebPRNT vs CloudPRNT (when each fits):
  https://starmicronics.com/blog/webprnt-cloudprnt-comparison/

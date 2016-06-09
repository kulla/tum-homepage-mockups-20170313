.PHONY: upload
upload:
	rsync -vr --delete html/ edu:~/kulla/homepage-mockups/

.PHONY: tidy
tidy:
	tidy -config tidy.conf -m -utf8 html/*html

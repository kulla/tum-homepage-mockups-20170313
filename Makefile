.PHONY: upload
upload:
	scp -r *_files *html edu:~/kulla/homepage-mockups

.PHONY: tidy
tidy:
	tidy -config tidy.conf -m -utf8 *html

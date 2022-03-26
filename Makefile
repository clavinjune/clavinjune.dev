IP = http://$(shell ipconfig getifaddr en0) 
build:
	@rm -rf docs/ && hugo --minify  && \
	cp CNAME docs/CNAME && \
	touch docs/.nojekyll && \
	cp docs/en/404.html docs/404.html
serve:
	hugo server -D \
	--minify --disableFastRender --i18n-warnings \
	--bind 0.0.0.0 --port 1313 --baseURL $(IP)
publish: build
	git commit -am "build `date -R #--rfc-3339=ns`" && \
	git push origin test-CI

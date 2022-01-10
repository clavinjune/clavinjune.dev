IP = http://$(shell ip -4 addr show wlp4s0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
build:
	@rm -rf docs/ && hugo --minify --i18n-warnings && \
	cp CNAME docs/CNAME && \
	touch docs/.nojekyll && \
	cp docs/en/404.html docs/404.html
serve:
	hugo server -D \
	--minify --disableFastRender --i18n-warnings \
	--bind 0.0.0.0 --port 1313 --baseURL $(IP)
publish: build
	@git add . && \
	git commit -sm "build `date --rfc-3339=ns`" && \
	git push origin master

IP = http://$(shell ipconfig getifaddr en0) 
build:
	@rm -rf docs/ && hugo --minify --printUnusedTemplates \
	--printI18nWarnings --printMemoryUsage --printPathWarnings && \
	cp CNAME docs/CNAME && \
	touch docs/.nojekyll && \
	cp docs/en/404.html docs/404.html
serve:
	hugo server -D -F --minify \
	--disableFastRender --printUnusedTemplates \
	--printI18nWarnings --printMemoryUsage --printPathWarnings \
	--bind 0.0.0.0 --port 1313 --baseURL $(IP)
publish: build
	@git add . && \
	git commit -sm "build `date -R #--rfc-3339=ns`" && \
	git push origin master
gen-utm:
	@echo "?utm_medium=organic_social&utm_term=social_media&utm_content=text&utm_source=link_clavinjune_dev"
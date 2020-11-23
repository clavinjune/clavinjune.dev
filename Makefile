serve:
	@rm -rf docs/ .jekyll-cache && bundle exec jekyll serve -d docs/
build:
	@rm -rf docs/ .jekyll-cache && bundle exec jekyll build -d docs/
publish:
	@make build && git add . && git commit -m "add new post" && git push origin master

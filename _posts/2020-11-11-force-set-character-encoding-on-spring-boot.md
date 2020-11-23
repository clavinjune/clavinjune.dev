---
category: Notes
tags: java spring-boot
description: >
  This post contains notes how to forcing set character encoding on spring boot.
---

Add this on your spring boot project:
```java
@Bean
@Order(Ordered.HIGHEST_PRECEDENCE)
public FilterRegistrationBean<CharacterEncodingFilter> characterEncodingFilterRegistration() {
  CharacterEncodingFilter filter = new CharacterEncodingFilter();
  filter.setEncoding("UTF-8"); // use your preferred encoding
  filter.setForceEncoding(true); // force the encoding

  FilterRegistrationBean<CharacterEncodingFilter> registrationBean =
    new FilterRegistrationBean<>(filter); // register the filter
  registrationBean.addUrlPatterns("/*"); // set preferred url
  return registrationBean;
}
```

[reference](https://www.baeldung.com/spring-boot-characterencodingfilter)
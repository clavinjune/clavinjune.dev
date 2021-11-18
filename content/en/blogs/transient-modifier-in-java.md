---
title: "Transient Modifier in Java"
date: 2020-11-18T00:00:00+07:00
draft: false
iscjklanguage: false
isarchived: true
categories: ["tech"]
images: []
aliases: ["/blog/transient-modifier-in-java-05f48e/"]
description: "This post contains notes on how to manage java class attribute exclusion during serialization using transient modifiers"
---

Data serialization library in Java could be varied. You can use Jackson, GSON, or anything else. Since there are too many serialization libraries out there, it's quite tricky to manage Java class attribute exclusion during serialization. Each library might have their own way to exclude the Java class attribute. Each Java project should only have 1 serialization library in order to maintain the standardization but, what if somehow in someway you need more than one serialization library?

Here comes `transient modifier` that helps you manage the java class attribute exclusion during serialization in language level. There's no need to memorize unique annotation like

```java
@Expose(serialize = false, deserialize = true)
```

or

```java
@JsonIgnore
```

You can only use `transient` keyword as your attribute modifier. Let's try it.

## Sample Class

```java
// Jackson need this annotation
// because it can't deserialize unknown properties. duh!
@JsonIgnoreProperties(ignoreUnknown = true)
public class Sample {
  // using transient modifier on foo
  public transient String foo;
  public String bar;

  @Override
  public String toString() {
    return "Sample{" +
        "foo='" + foo + '\'' +
        ", bar='" + bar + '\'' +
        '}';
  }

  public static void main(String[] args) throws Exception {
    String json = "{\"foo\":\"foox\",\"bar\":\"barx\"}";

    // by default jackson not reading any attribute,
    // jackson only read public default Getter
    // so jackson need to have this configuration to mark transient attributes
    ObjectMapper jackson = new ObjectMapper()
        .configure(MapperFeature.PROPAGATE_TRANSIENT_MARKER, true);
    Gson gson = new Gson();

    Sample byJackson = jackson.readValue(json, Sample.class);
    Sample byGson = gson.fromJson(json, Sample.class);

    System.out.println("deserialization by jackson: " + byJackson);
    System.out.println("deserialization by gson: " + byGson);

    System.out.println("serialization by gson: " + gson.toJson(byGson));
    System.out.println("serialization by jackson: " + jackson.writeValueAsString(byJackson));
  }
}
```

## output

```plain
deserialization by jackson: Sample{foo='null', bar='barx'}
deserialization by gson: Sample{foo='null', bar='barx'}
serialization by gson: {"bar":"barx"}
serialization by jackson: {"bar":"barx"}
```

Yep, as we expect, foo attribute isn't serialized. `transient` modifier would work just fine as long as the attribute itself has no `static` or `final` modifier. Whenever a `transient` attribute has `static` or `final` modifier, the `transient` modifier has no effect on that attribute.

Thank you for reading!

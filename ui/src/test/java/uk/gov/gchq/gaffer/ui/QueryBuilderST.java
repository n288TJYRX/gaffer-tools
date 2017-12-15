package uk.gov.gchq.gaffer.ui;

import com.google.common.collect.Maps;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import uk.gov.gchq.gaffer.exception.SerialisationException;
import uk.gov.gchq.gaffer.graph.Graph;
import uk.gov.gchq.gaffer.jsonserialisation.JSONSerialiser;
import uk.gov.gchq.gaffer.named.operation.AddNamedOperation;
import uk.gov.gchq.gaffer.named.operation.DeleteNamedOperation;
import uk.gov.gchq.gaffer.named.operation.ParameterDetail;
import uk.gov.gchq.gaffer.operation.OperationException;
import uk.gov.gchq.gaffer.proxystore.ProxyStore;
import uk.gov.gchq.gaffer.user.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * UI system test. Runs a simple query for road use around junction M5:10.
 * Assumes the Road Traffic Demo UI is running at localhost:8080.
 * To run this selenium test you must have installed the gecko driver, see
 * https://github.com/mozilla/geckodriver/releases
 * This test can be run via maven using the system-test profile
 * <pre>
 * mvn verify -Psystem-test -Dwebdriver.gecko.driver=/path/to/geckodriver -pl ui/
 * </pre>
 */
public class QueryBuilderST {
    public static final String GECKO_PROPERTY = "webdriver.gecko.driver";
    public static final String URL_PROPERTY = "gaffer.ui.test.url";
    public static final String SLOW_FACTOR_PROPERTY = "gaffer.ui.test.slow-factor";
    private static final String DEFAULT_URL = "http://localhost:8080/ui";
    private static final String DEFAULT_SLOW_FACTOR = "5";

    private static final String EXPECTED_OPERATION_JSON = "{\n" +
            "  \"class\": \"uk.gov.gchq.gaffer.operation.impl.get.GetElements\",\n" +
            "  \"input\": [\n" +
            "    {\n" +
            "      \"class\": \"uk.gov.gchq.gaffer.operation.data.EntitySeed\",\n" +
            "      \"vertex\": \"M5:10\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"view\": {\n" +
            "    \"globalElements\": [\n" +
            "      {\n" +
            "        \"groupBy\": []\n" +
            "      }\n" +
            "    ],\n" +
            "    \"entities\": {},\n" +
            "    \"edges\": {\n" +
            "      \"RoadUse\": {\n" +
            "        \"preAggregationFilterFunctions\": [\n" +
            "          {\n" +
            "            \"predicate\": {\n" +
            "              \"class\": \"uk.gov.gchq.koryphe.impl.predicate.IsMoreThan\",\n" +
            "              \"value\": {\n" +
            "                \"java.util.Date\": 971416800000\n" +
            "              }\n" +
            "            },\n" +
            "            \"selection\": [\n" +
            "              \"startDate\"\n" +
            "            ]\n" +
            "          }\n" +
            "        ]\n" +
            "      }\n" +
            "    }\n" +
            "  },\n" +
            "  \"includeIncomingOutGoing\": \"EITHER\"\n" +
            "}";
    private static final String EXPECTED_RESULTS[] = {
            "\"group\": \"RoadUse\",\n" +
                    "    \"source\": \"M5:10\",\n" +
                    "    \"destination\": \"M5:9\",\n" +
                    "    \"directed\": true,\n" +
                    "    \"matchedVertex\": \"SOURCE\"",
            "\"group\": \"RoadUse\",\n" +
                    "    \"source\": \"M5:11\",\n" +
                    "    \"destination\": \"M5:10\",\n" +
                    "    \"directed\": true,\n" +
                    "    \"matchedVertex\": \"DESTINATION\""
    };

    private static WebDriver driver;
    private static String url;
    private static int slowFactor;

    @BeforeClass
    public static void beforeClass() throws OperationException {
        assertNotNull("System property " + GECKO_PROPERTY + " has not been set", System.getProperty(GECKO_PROPERTY));
        url = System.getProperty(URL_PROPERTY, DEFAULT_URL);
        slowFactor = Integer.parseInt(System.getProperty(SLOW_FACTOR_PROPERTY, DEFAULT_SLOW_FACTOR));
        driver = new FirefoxDriver();

        // Create a large window to ensure we don't need to scroll
        final Dimension dimension = new Dimension(1200, 1000);
        driver.manage().window().setSize(dimension);
        addNamedOperation();
    }

    @AfterClass
    public static void afterClass() {
        try {
            driver.close();
            deleteNamedOperation();
        } catch (final Exception e) {
            // ignore errors
        }
    }

    @Before
    public void before() throws InterruptedException {
        driver.get(url);
        Thread.sleep(slowFactor * 1000);
    }

    @Test
    public void shouldFindRoadUseAroundJunctionM5_10() throws InterruptedException {
        click("Get Elements");
        selectOption("vertexType", "junction");
        enterText("seedVertex", "M5:10");
        click("add-seeds");
        click("related-edge-RoadUse");
        click("RoadUse-add-pre-filter");
        selectOption("RoadUse-pre-property-selector", "startDate");
        selectOption("RoadUse-pre-startDate-predicate-selector", "uk.gov.gchq.koryphe.impl.predicate.IsMoreThan");
        enterText("RoadUse-pre-startDate-uk.gov.gchq.koryphe.impl.predicate.IsMoreThan-value", "{\"java.util.Date\": 971416800000}");
        click("Execute Query");

        click("open-raw");
        assertEquals(EXPECTED_OPERATION_JSON, getElement("operation-0-json").getText().trim());

        clickTab("Results");
        final String results = getElement("raw-edge-results").getText().trim();
        for (final String expectedResult : EXPECTED_RESULTS) {
            assertTrue("Results did not contain: \n" + expectedResult
                    + "\nActual results: \n" + results, results.contains(expectedResult));
        }
    }

    @Test
    public void shouldBeAbleToRunParameterisedQueries() throws InterruptedException, SerialisationException {
        click("Two Hop With Limit");
        selectOption("vertexType", "road");
        enterText("seedVertex", "M5");
        click("add-seeds");
        enterText("param-param1-", Keys.BACK_SPACE.toString() + "2");
        click("Execute Query");

        click("open-raw");
        clickTab("Results");

        final String results = getElement("raw-entity-seed-results").getText().trim();
        final List resultList = JSONSerialiser.deserialise(results.getBytes(), ArrayList.class);

        assertEquals("Parameterised Named Operation returned wrong number of results", 2, resultList.size());

        final String[] expectedResults = {"352952,178032", "M5:18A"};
        for (final String result : expectedResults) {
            assertTrue(result + "was not found in results: " + resultList.toString(), resultList.contains(result));
        }
    }

    private void enterText(final String id, final String value) {
        getElement(id).sendKeys(value);
    }

    private void selectOption(final String id, final String optionValue) throws InterruptedException {
        getElement(id).click();

        WebElement choice = driver.findElement(By.cssSelector("md-option[value = '" + optionValue + "']"));
        choice.click();

        Thread.sleep(slowFactor * 500);
    }

    private void click(final String id) throws InterruptedException {
        getElement(id).click();
        Thread.sleep(slowFactor * 500);
    }

    private void clickTab(final String tabTitle) {
        driver.findElement(By.xpath("//md-tab-item//span[contains(text(), '" + tabTitle + "')]")).click();
    }

    private void execute(final String script) {
        ((JavascriptExecutor) driver).executeScript(script);
    }

    private WebElement getElement(final String id) {
        try {
            return driver.findElement(By.id(id));
        } catch (final Exception e) {
            // ignore error
        }

        try {
            return driver.findElement(By.className(id));
        } catch (final Exception e) {
            // ignore error
        }

        // try using the id as a tag name
        return driver.findElement(By.tagName(id));
    }

    private static void deleteNamedOperation() throws OperationException {
        Graph graph = new Graph.Builder()
                .store(new ProxyStore.Builder()
                        .graphId("graphId1")
                        .host("localhost")
                        .port(8080)
                        .connectTimeout(1000)
                        .contextRoot("rest")
                        .build())
                .build();

        graph.execute(new DeleteNamedOperation.Builder()
                .name("Two Hop With Limit")
                .build(), new User());
    }

    private static void addNamedOperation() throws OperationException {
        Graph graph = new Graph.Builder()
                .store(new ProxyStore.Builder()
                        .graphId("graphId1")
                        .host("localhost")
                        .port(8080)
                        .connectTimeout(1000)
                        .contextRoot("rest")
                        .build())
                .build();

        final String opChainString = "{" +
                "    \"operations\" : [ {" +
                "      \"class\" : \"uk.gov.gchq.gaffer.operation.impl.get.GetAdjacentIds\"," +
                "      \"includeIncomingOutGoing\" : \"OUTGOING\"" +
                "    }, {" +
                "      \"class\" : \"uk.gov.gchq.gaffer.operation.impl.get.GetAdjacentIds\"," +
                "      \"includeIncomingOutGoing\" : \"OUTGOING\"" +
                "    }, {" +
                "      \"class\" : \"uk.gov.gchq.gaffer.operation.impl.Limit\"," +
                "      \"resultLimit\" : \"${param1}\"" +
                "    }" +
                " ]" +
                "}";

        ParameterDetail param = new ParameterDetail.Builder()
                .defaultValue(1L)
                .description("Limit param")
                .valueClass(Long.class)
                .build();
        Map<String, ParameterDetail> paramMap = Maps.newHashMap();
        paramMap.put("param1", param);

        graph.execute(
                new AddNamedOperation.Builder()
                        .name("Two Hop With Limit")
                        .description("Two Adjacent Ids queries with customisable limit")
                        .operationChain(opChainString)
                        .parameters(paramMap)
                        .overwrite()
                        .build(),
                new User()
        );
    }
}
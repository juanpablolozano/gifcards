import {
  Accordion,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  SimpleGrid,
  Span,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const features = [
  {
    title: "Sell digital gift cards",
    description:
      "Create branded gift cards in minutes and share a storefront link with your customers.",
    icon: "🎁",
  },
  {
    title: "Track sales & redemptions",
    description:
      "Monitor revenue, outstanding balances, and recent activity from a single dashboard.",
    icon: "📊",
  },
  {
    title: "Redeem in-store or online",
    description:
      "Staff can redeem cards quickly with a secure code lookup and partial redemption support.",
    icon: "✅",
  },
];

const steps = [
  {
    step: "1",
    title: "Create your account",
    description: "Sign up and complete a short onboarding to set up your business profile.",
  },
  {
    step: "2",
    title: "Design your gift cards",
    description: "Choose amounts, messaging, and branding that match your business.",
  },
  {
    step: "3",
    title: "Share & get paid",
    description: "Publish your storefront link and start accepting gift card purchases.",
  },
];

const faqItems = [
  {
    value: "what-is",
    question: "What is Gifcards?",
    answer:
      "Gifcards helps local businesses sell and manage digital gift cards with a simple dashboard, branded storefront, and redemption tools.",
  },
  {
    value: "pricing",
    question: "How much does it cost?",
    answer:
      "You can get started for free. Transaction fees may apply when you enable payments through our supported providers.",
  },
  {
    value: "setup",
    question: "How long does setup take?",
    answer:
      "Most merchants complete onboarding in under five minutes. Publishing your first gift card takes just a few more steps.",
  },
  {
    value: "redeem",
    question: "How do redemptions work?",
    answer:
      "When a customer presents their gift card code, your team can look it up in the redeem flow and apply the balance to their purchase.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Box minH="100vh" bg="surface">
      <Box as="header" bg="white" borderBottomWidth="1px" borderColor="border" py={4}>
        <Container maxW="6xl">
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={3}>
              <Flex
                align="center"
                justify="center"
                boxSize="40px"
                borderRadius="button"
                bg="secondary"
                color="white"
                fontWeight="bold"
              >
                G
              </Flex>
              <Heading size="lg" color="primary">
                Gifcards
              </Heading>
            </Flex>
            <Flex gap={3}>
              <Button asChild variant="ghost" color="primary">
                <RouterLink to="/login">Log in</RouterLink>
              </Button>
              <Button asChild bg="secondary" color="white" _hover={{ bg: "#4338CA" }}>
                <RouterLink to="/signup">Get started</RouterLink>
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Box as="section" py={{ base: 16, md: 24 }}>
        <Container maxW="6xl">
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} alignItems="center">
            <VStack align="start" gap={6}>
              <Heading size="3xl" color="primary" lineHeight="1.1">
                Gift cards that grow your business
              </Heading>
              <Text fontSize="lg" color="textSecondary" maxW="lg">
                Launch a branded gift card program without complicated setup. Sell online,
                track performance, and redeem with confidence.
              </Text>
              <Flex gap={4} flexWrap="wrap">
                <Button asChild size="lg" bg="secondary" color="white" _hover={{ bg: "#4338CA" }}>
                  <RouterLink to="/signup">Start for free</RouterLink>
                </Button>
                <Button asChild size="lg" variant="outline" borderColor="border">
                  <RouterLink to="/login">Log in</RouterLink>
                </Button>
              </Flex>
            </VStack>
            <Box
              bg="white"
              borderWidth="1px"
              borderColor="border"
              borderRadius="card"
              p={8}
              boxShadow="lg"
            >
              <VStack align="start" gap={4}>
                <Text fontSize="sm" color="textSecondary" fontWeight="600">
                  LIVE PREVIEW
                </Text>
                <Box
                  w="full"
                  borderRadius="xl"
                  bg="linear-gradient(135deg, #111827 0%, #4F46E5 100%)"
                  color="white"
                  p={8}
                  minH="220px"
                >
                  <VStack align="start" justify="space-between" h="full" gap={4}>
                    <Text fontSize="sm" opacity={0.8}>
                      Your Business
                    </Text>
                    <Heading size="lg">Holiday Gift Card</Heading>
                    <Heading size="2xl">$50.00</Heading>
                    <Text fontSize="sm" opacity={0.9}>
                      Treat someone special today.
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Box as="section" py={16} bg="white">
        <Container maxW="6xl">
          <VStack gap={10} align="stretch">
            <VStack gap={2} textAlign="center">
              <Heading size="xl" color="primary">
                Everything you need to run gift cards
              </Heading>
              <Text color="textSecondary" maxW="2xl">
                From creation to redemption, Gifcards keeps the workflow simple for you and
                your team.
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
              {features.map((feature) => (
                <Box
                  key={feature.title}
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="card"
                  p={6}
                  bg="surface"
                >
                  <Text fontSize="2xl" mb={3}>
                    {feature.icon}
                  </Text>
                  <Heading size="md" color="primary" mb={2}>
                    {feature.title}
                  </Heading>
                  <Text color="textSecondary">{feature.description}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      <Box as="section" py={16}>
        <Container maxW="6xl">
          <VStack gap={10} align="stretch">
            <Heading size="xl" color="primary" textAlign="center">
              How it works
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
              {steps.map((item) => (
                <Box
                  key={item.step}
                  bg="white"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="card"
                  p={6}
                >
                  <Flex
                    align="center"
                    justify="center"
                    boxSize="36px"
                    borderRadius="full"
                    bg="secondary"
                    color="white"
                    fontWeight="bold"
                    mb={4}
                  >
                    {item.step}
                  </Flex>
                  <Heading size="md" color="primary" mb={2}>
                    {item.title}
                  </Heading>
                  <Text color="textSecondary">{item.description}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      <Box as="section" py={16} bg="white">
        <Container maxW="3xl">
          <VStack gap={8} align="stretch">
            <Heading size="xl" color="primary" textAlign="center">
              Frequently asked questions
            </Heading>
            <Accordion.Root collapsible multiple>
              {faqItems.map((item) => (
                <Accordion.Item key={item.value} value={item.value}>
                  <Accordion.ItemTrigger px={4} py={3}>
                    <Span flex="1" textAlign="left" fontWeight="medium" color="primary">
                      {item.question}
                    </Span>
                    <Accordion.ItemIndicator />
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Accordion.ItemBody px={4} pb={4} color="textSecondary">
                      {item.answer}
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </VStack>
        </Container>
      </Box>

      <Box as="section" py={16} bg="primary" color="white">
        <Container maxW="4xl">
          <VStack gap={6} textAlign="center">
            <Heading size="xl">Ready to launch your gift cards?</Heading>
            <Text opacity={0.85} maxW="lg">
              Join merchants using Gifcards to drive repeat visits and upfront revenue.
            </Text>
            <Flex gap={4} flexWrap="wrap" justify="center">
              <Button asChild size="lg" bg="secondary" color="white" _hover={{ bg: "#4338CA" }}>
                <RouterLink to="/signup">Create your account</RouterLink>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                borderColor="whiteAlpha.400"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                <RouterLink to="/login">Log in</RouterLink>
              </Button>
            </Flex>
          </VStack>
        </Container>
      </Box>

      <Box as="footer" py={8} borderTopWidth="1px" borderColor="border">
        <Container maxW="6xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Text fontSize="sm" color="textSecondary">
              © {new Date().getFullYear()} Gifcards. All rights reserved.
            </Text>
            <Flex gap={4}>
              <Link fontSize="sm" color="secondary">
                Privacy
              </Link>
              <Link fontSize="sm" color="secondary">
                Terms
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

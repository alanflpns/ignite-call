import { Button, Heading, MultiStep, Text } from "@ignite-ui/react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ArrowRight, Check } from "phosphor-react";
import { Container, Header } from "../styles";
import { ConnectBox, ConnectItem, AuthError } from "./styles";

export default function ConnectCalendar() {
  const session = useSession();
  const router = useRouter();

  const isSignedIn = session.status === "authenticated";
  const hasAuthError = !!router.query?.error && !isSignedIn;

  async function handleConnectCalendar() {
    await signIn("google");
  }

  async function handleNavigateToNextStep() {
    await router.push("/register/time-intervals");
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Conecte sua agenda!</Heading>
        <Text>
          Conecte o seu calendário para verificar automaticamente as horas
          ocupadas e os novos eventos à medida em que são agendados.
        </Text>

        <MultiStep size={4} currentStep={2} />
      </Header>

      <ConnectBox>
        <ConnectItem>
          <Text>Google Calendar</Text>

          {isSignedIn ? (
            <Button disabled size="sm">
              Conectado
              <Check />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConnectCalendar}
            >
              Conectar
              <ArrowRight />
            </Button>
          )}
        </ConnectItem>

        {hasAuthError && (
          <AuthError size="sm">
            Falha ao se conectar ao Google, verifique se voce habilitou as
            permissões de acesso ao Google Calendar.
          </AuthError>
        )}

        <Button onClick={handleNavigateToNextStep} disabled={!isSignedIn}>
          Próximo passo
          <ArrowRight />
        </Button>
      </ConnectBox>
    </Container>
  );
}

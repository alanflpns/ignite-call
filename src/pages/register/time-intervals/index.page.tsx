import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from "@ignite-ui/react";
import { useRouter } from "next/router";
import { ArrowRight } from "phosphor-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../lib/axios";
import { convertTimeStringToMinutes } from "../../../utils/convert-time-string-to-minutes";
import { getWeekDays } from "../../../utils/get-week-days";
import { Container, Header } from "../styles";
import {
  FormError,
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from "./styles";

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekday: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: "Você precisa selecionar pelo menos um dia da semana!",
    })
    .transform((intervals) =>
      intervals.map((interval) => ({
        weekday: interval.weekday,
        startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
        endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
      }))
    )
    .refine(
      (intervals) =>
        intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes
        ),
      { message: "O intervalo de tempo deve ser de pelo menos 1 hora" }
    ),
});

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>;
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>;

export default function TimeIntervals() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekday: 0, enabled: false, startTime: "08:00", endTime: "18:00" },
        { weekday: 1, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekday: 2, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekday: 3, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekday: 4, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekday: 5, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekday: 6, enabled: false, startTime: "08:00", endTime: "18:00" },
      ],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "intervals",
  });

  const weekdays = getWeekDays();
  const intervals = watch("intervals");

  async function handleSetTimeIntervals(data: TimeIntervalsFormOutput) {
    await api.post("/users/time-intervals", data);

    await router.push("/register/update-profile");
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Quase lá</Heading>
        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana
        </Text>

        <MultiStep size={4} currentStep={3} />
      </Header>

      <IntervalBox
        as="form"
        onSubmit={handleSubmit(handleSetTimeIntervals as any)}
      >
        <IntervalsContainer>
          {fields.map((field, index) => (
            <IntervalItem key={field.id}>
              <IntervalDay>
                <Controller
                  name={`intervals.${index}.enabled`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      checked={field.value}
                    />
                  )}
                />

                <Text>{weekdays[field.weekday]}</Text>
              </IntervalDay>
              <IntervalInputs>
                <TextInput
                  size="sm"
                  type="time"
                  step={60}
                  disabled={!intervals[index].enabled}
                  {...register(`intervals.${index}.startTime`)}
                />
                <TextInput
                  size="sm"
                  type="time"
                  step={60}
                  disabled={!intervals[index].enabled}
                  {...register(`intervals.${index}.endTime`)}
                />
              </IntervalInputs>
            </IntervalItem>
          ))}
        </IntervalsContainer>

        {errors.intervals && (
          <FormError size="sm">{errors.intervals.message}</FormError>
        )}

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  );
}

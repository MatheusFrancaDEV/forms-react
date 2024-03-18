import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "./lib/supabase";

/*
 * To-do
 *
 * [x] Validação / transformação
 * [x] Field Arrays
 * [x] Upload de arquivos
 * [ ] Composition Pattern
 */

const createUserFormSchema = z.object({
  name: z
    .string()
    .nonempty("O nome é obrigatorio")
    .transform((name) => {
      return name
        .trim()
        .split(" ")
        .map((word) => {
          return word[0].toLocaleUpperCase().concat(word.substring(1));
        })
        .join(" ");
    }),
  email: z
    .string()
    .nonempty("O email é obrigatório")
    .email("Formato de e-mail inválido")
    .toLowerCase()
    .refine((email) => {
      return email.endsWith("@rocketseat.com.br");
    }, "O e-mail precisa ser da Rocketseat"),
  password: z.string().min(6, "A senha precisa de no mínimo 6 caracteres"),
  techs: z
    .array(
      z.object({
        title: z.string().nonempty("O título é obrigatório"),
        knowledge: z.coerce.number().min(1).max(100),
      })
    )
    .min(2, "Insira pelo menos 2 tecnologias"),
  avatar: z
    .instanceof(FileList)
    .transform((list) => list.item(0)!)
    .refine(
      (file) => file!.size <= 5 * 1024 * 1024,
      "O arquivo precisa ter no maximo 5mb"
    ),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export function App() {
  const [ouput, setOutput] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  async function createUser(data: CreateUserFormData) {
    await supabase.storage
      .from("forms-react")
      .upload(data.avatar?.name, data.avatar);
    setOutput(JSON.stringify(data, null, 2));
  }

  function addNewTech() {
    append({ title: "", knowledge: 0 });
  }

  return (
    <main className="h-screen bg-zinc-950 text-zinc-300 flex items-center justify-center flex-col gap-10">
      <form
        onSubmit={handleSubmit(createUser)}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            className="border border-zinc-800 text-white shadow-sm rounded h-10 px-3 bg-zinc-800"
            type="text"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            className="border border-zinc-800 text-white shadow-sm rounded h-10 px-3 bg-zinc-800"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="senha">Senha</label>
          <input
            className="border border-zinc-800 text-white shadow-sm rounded h-10 px-3 bg-zinc-800"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar">Avatar</label>
          <input type="file" accept="image/*" {...register("avatar")} />
          {errors.avatar && (
            <span className="text-red-500 text-sm">
              {errors.avatar.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-center justify-between" htmlFor="">
            Tecnologias
            <button
              type="button"
              className="text-emerald-500 text-sm"
              onClick={addNewTech}
            >
              Adicionar
            </button>
          </label>
          {fields.map((field, index) => {
            return (
              <div className="flex gap-1" key={field.id}>
                <div className="flex flex-col gap-1 flex-1">
                  <input
                    className="border border-zinc-800 text-white shadow-sm rounded h-10 px-3 bg-zinc-800"
                    type="text"
                    {...register(`techs.${index}.title`)}
                  />
                  {errors.techs?.[index]?.title && (
                    <span className="text-red-500 text-sm">
                      {errors.techs?.[index]?.title?.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    className="w-16 border border-zinc-800 text-white shadow-sm rounded h-10 px-3 bg-zinc-800"
                    type="number"
                    {...register(`techs.${index}.knowledge`)}
                  />
                  {errors.techs?.[index]?.knowledge && (
                    <span className="text-red-500 text-sm">
                      {errors.techs?.[index]?.knowledge?.message}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {errors.techs && (
            <span className="text-red-500 text-sm">{errors.techs.message}</span>
          )}
        </div>

        <button
          className="bg-emerald-500 rounded font-semibold text-white h-10 hover:bg-emerald-600"
          type="submit"
        >
          Salvar
        </button>
      </form>
      <pre>{ouput}</pre>
    </main>
  );
}

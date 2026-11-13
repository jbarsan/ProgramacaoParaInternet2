interface HelloProps {
    nome:string
}

export function Hello(props: HelloProps) {
    return <h1>{props.nome}</h1>
}
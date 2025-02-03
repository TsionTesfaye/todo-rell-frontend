export type fetchedTask = {
    title: string,
    description: string,
    duedate: string,
    id: Uint8Array,
    iscomplete: number,
    timestamp: number,
    user: {
        account: number,
        id: Uint8Array,
        name: string
    }

}
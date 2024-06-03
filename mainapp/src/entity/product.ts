import { Entity, Column, ObjectIdColumn, ObjectId } from "typeorm"


@Entity()
export default class Product {
    @ObjectIdColumn()
    _id: ObjectId | undefined
    
    @Column({ unique: true })
    admin_id!: string;

    @Column()
    name!: string;

    @Column()
    image!: string;
    
    @Column({default: 0 })
    likes!: number;
}
"use client"

import { useState, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Country } from "country-state-city"
import { isValidPhoneNumber } from "react-phone-number-input"
import { isAxiosError } from "axios"
import {
	ArrowRight,
	Check,
	ChevronRight,
	Globe2,
	Loader2,
	MapPin,
	Pencil,
	ShieldCheck,
	ShoppingBag,
	Store,
	UserRound,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import { useAuthStore } from "@/stores/auth-store"
import type { SellerAccount, SellerAccountFields } from "@/types/marketplace"
import { cn } from "@/lib/utils"
import { EmptyState, ErrorState, LoadingState, PageHeading, Panel } from "./shared"
import { SellerVerification } from "./seller-verification"

const accountKey = ["marketplace", "account"] as const
const countries = Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name))
const countryName = (value: string) =>
	countries.find((c) => c.isoCode === value || c.name === value)?.name || value
const countryCode = (value: string) =>
	countries.find((c) => c.isoCode === value || c.name === value)?.isoCode || value
const fieldClass =
	"h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-muted/60 disabled:text-muted-foreground"

function isMissingSeller(error: unknown) {
	return (
		isAxiosError(error) &&
		error.response?.status === 404 &&
		error.response.data?.code === "seller_profile_missing"
	)
}

function useSellerAccount() {
	return useQuery({
		queryKey: accountKey,
		queryFn: marketplaceApi.account,
		retry: (count, error) =>
			isAxiosError(error) && error.response?.status === 404 ? false : count < 1,
		staleTime: 30000,
	})
}

function SetupPrompt() {
	return (
		<Panel>
			<EmptyState
				title="Make room for your business"
				description="Set up your seller account with your business and contact details to start listing products."
				action={
					<Button asChild className="rounded-full">
						<Link href="/market-vendor/setup">
							Set up your store <ArrowRight size={15} />
						</Link>
					</Button>
				}
			/>
		</Panel>
	)
}

export function SellerAccountPage() {
	const account = useSellerAccount()
	const user = useAuthStore((s) => s.user)
	if (account.isPending) return <LoadingState />
	if (account.isError)
		return isMissingSeller(account.error) ? (
			<SetupPrompt />
		) : (
			<ErrorState error={account.error} retry={() => account.refetch()} />
		)
	const data = account.data
	const name =
		data.full_name ||
		[user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
		"Your account"
	return (
		<>
			<PageHeading
				title="Account"
				description="The details behind your business. Keep them up to date."
				actions={
					<Button asChild variant="outline" className="rounded-full">
						<Link href="/market-vendor/account/edit">
							<Pencil size={15} /> Edit account
						</Link>
					</Button>
				}
			/>
			<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
				<div className="space-y-6">
					<Panel className="p-0">
						<Link
							href="/market-vendor/account/edit"
							className="group flex items-center gap-5 rounded-2xl p-7 focus-visible:outline-2 focus-visible:outline-primary"
						>
							<div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
								{user?.profile_photo ? (
									<Image
										src={user.profile_photo}
										alt={name}
										fill
										unoptimized
										className="object-cover"
									/>
								) : (
									<UserRound size={29} strokeWidth={1.6} />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<h2 className="truncate text-lg font-semibold group-hover:text-primary">{name}</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									Edit your business and contact information
								</p>
							</div>
							<ChevronRight size={20} className="text-muted-foreground" />
						</Link>
					</Panel>
					<SellerVerification account={data} />
					<Panel>
						<div className="mb-6 flex items-center justify-between">
							<h2 className="font-semibold">Business details</h2>
							<Link
								href="/market-vendor/account/edit"
								className="text-xs font-medium text-primary hover:underline"
							>
								Edit details →
							</Link>
						</div>
						<dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
							<AccountDetail label="Business name" icon={<Store size={15} />}>
								{data.business_name}
							</AccountDetail>
							<AccountDetail label="Business country" icon={<Globe2 size={15} />}>
								{countryName(data.country)}
							</AccountDetail>
							<div className="sm:col-span-2">
								<AccountDetail label="About your business">
									{data.business_description}
								</AccountDetail>
							</div>
							<div className="sm:col-span-2">
								<dt className="mb-2.5 text-xs text-muted-foreground">Business categories</dt>
								<dd className="flex flex-wrap gap-2">
									{data.business_categories?.map((category) => (
										<span
											key={category}
											className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary"
										>
											{category}
										</span>
									))}
								</dd>
							</div>
							<div className="sm:col-span-2">
								<AccountDetail label="Store address" icon={<MapPin size={15} />}>
									{data.store_address}
								</AccountDetail>
							</div>
						</dl>
					</Panel>
				</div>
				<div className="space-y-6">
					<Panel>
						<h2 className="mb-5 text-sm font-semibold">Contact information</h2>
						<dl className="space-y-5">
							<AccountDetail label="Full name">{data.full_name}</AccountDetail>
							<AccountDetail label="Phone number">{data.phone_number}</AccountDetail>
							<AccountDetail label="Selling area">
								{data.sell_scope === "global" ? "Worldwide" : "Local"}
							</AccountDetail>
						</dl>
					</Panel>
					<Panel className="bg-primary/5">
						<ShoppingBag size={25} className="mb-4 text-primary" />
						<h2 className="text-sm font-semibold">Something for you, too</h2>
						<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
							Explore the marketplace as a buyer. Your seller account and products stay here.
						</p>
						<Button asChild className="mt-5 h-auto w-full rounded-full px-4 py-3 text-xs">
							<Link href="/marketplace/homes">
								Switch to buyer’s account <ArrowRight size={14} />
							</Link>
						</Button>
					</Panel>
					<div className="px-2">
						<p className="text-xs text-muted-foreground">Need help with your account?</p>
						<Link
							href="/support"
							className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
						>
							Contact support →
						</Link>
					</div>
				</div>
			</div>
		</>
	)
}

function AccountDetail({
	label,
	icon,
	children,
}: {
	label: string
	icon?: ReactNode
	children: ReactNode
}) {
	return (
		<div>
			<dt className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
				{icon}
				{label}
			</dt>
			<dd className="whitespace-pre-wrap break-words text-sm leading-relaxed">
				{children || "Not provided"}
			</dd>
		</div>
	)
}

export function SellerAccountEditor({ setup = false }: { setup?: boolean }) {
	const account = useSellerAccount()
	if (account.isPending) return <LoadingState />
	if (account.isError && !(setup && isMissingSeller(account.error)))
		return isMissingSeller(account.error) ? (
			<SetupPrompt />
		) : (
			<ErrorState error={account.error} retry={() => account.refetch()} />
		)
	return <AccountForm key={account.data?.id || "setup"} account={account.data} setup={setup} />
}

function AccountForm({ account, setup }: { account?: SellerAccount; setup: boolean }) {
	const router = useRouter()
	const user = useAuthStore((s) => s.user)
	const client = useQueryClient()
	const [error, setError] = useState("")
	const [search, setSearch] = useState("")
	const [values, setValues] = useState<SellerAccountFields>(() => ({
		country: account?.country || "NG",
		sell_scope: account?.sell_scope || "local",
		business_name: account?.business_name || "",
		business_description: account?.business_description || "",
		business_categories: account?.business_categories || [],
		full_name: account?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(" "),
		phone_number: account?.phone_number || user?.phone_number || "",
		store_address: account?.store_address || "",
	}))
	const categories = useQuery({
		queryKey: ["marketplace", "categories"],
		queryFn: marketplaceApi.categories,
	})
	const save = useMutation({
		mutationFn: (payload: SellerAccountFields) =>
			setup ? marketplaceApi.setupAccount(payload) : marketplaceApi.updateAccount(payload),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["marketplace"] })
			toast.success(setup ? "Seller account set up" : "Account details saved")
			router.push("/market-vendor/account")
		},
		onError: (err) => setError(marketplaceError(err)),
	})
	const countryLocked = !!account?.has_payment_account
	const availableCategories = Array.from(
		new Set([...(categories.data?.map((c) => c.name) || []), ...values.business_categories]),
	)
	const set = <K extends keyof SellerAccountFields>(key: K, value: SellerAccountFields[K]) =>
		setValues((current) => ({ ...current, [key]: value }))
	return (
		<>
			<PageHeading
				title={setup ? "Set up your store" : "Edit account"}
				description="Make it easy for customers to get to know your business."
				back="/market-vendor/account"
				backLabel="Back to account"
				actions={
					<>
						<Button variant="outline" asChild className="rounded-full">
							<Link href="/market-vendor/account">Cancel</Link>
						</Button>
						<Button
							type="submit"
							form="seller-account-form"
							disabled={save.isPending || categories.isPending || categories.isError}
							className="rounded-full px-5"
						>
							{save.isPending && <Loader2 size={15} className="animate-spin" />}
							{save.isPending ? "Saving…" : setup ? "Create seller account" : "Save changes"}
						</Button>
					</>
				}
			/>
			<form
				id="seller-account-form"
				onSubmit={(event) => {
					event.preventDefault()
					setError("")
					if (!values.business_categories.length) {
						setError("Select at least one business category.")
						return
					}
					if (!isValidPhoneNumber(values.phone_number)) {
						setError("Enter a valid phone number including its country code, for example +234.")
						return
					}
					if (
						!values.business_name.trim() ||
						!values.business_description.trim() ||
						!values.full_name.trim() ||
						!values.store_address.trim()
					) {
						setError("Complete all business and contact details.")
						return
					}
					save.mutate({
						...values,
						business_name: values.business_name.trim(),
						business_description: values.business_description.trim(),
						full_name: values.full_name.trim(),
						store_address: values.store_address.trim(),
					})
				}}
			>
				{error && (
					<p
						role="alert"
						className="mb-6 rounded-xl bg-destructive/5 px-5 py-4 text-sm text-destructive"
					>
						{error}
					</p>
				)}
				<fieldset
					disabled={save.isPending}
					className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]"
				>
					<div className="min-w-0 space-y-6">
						<Panel>
							<h2 className="mb-1 font-semibold">About your business</h2>
							<p className="mb-6 text-xs text-muted-foreground">
								Your name, story, and where you do business.
							</p>
							<div className="space-y-5">
								<FormField label="Business country" id="business-country">
									<select
										id="business-country"
										value={countryCode(values.country)}
										disabled={countryLocked}
										onChange={(e) => set("country", e.target.value)}
										className={fieldClass}
									>
										{countries.map((c) => (
											<option key={c.isoCode} value={c.isoCode}>
												{c.name}
											</option>
										))}
									</select>
									{countryLocked && (
										<p className="mt-2 text-[11px] text-muted-foreground">
											Your business country is tied to your payment account. Contact support if it
											needs to change.
										</p>
									)}
								</FormField>
								<FormField label="Business name" id="business-name">
									<input
										id="business-name"
										required
										maxLength={255}
										value={values.business_name}
										onChange={(e) => set("business_name", e.target.value)}
										placeholder="What do you want to name your business?"
										className={fieldClass}
									/>
								</FormField>
								<FormField label="Business description" id="business-description">
									<textarea
										id="business-description"
										required
										rows={5}
										value={values.business_description}
										onChange={(e) => set("business_description", e.target.value)}
										placeholder="Tell customers about your business and what you sell…"
										className={cn(fieldClass, "h-auto resize-y py-3 leading-relaxed")}
									/>
								</FormField>
								<FormField label="Where do you sell?" id="selling-area">
									<select
										id="selling-area"
										value={values.sell_scope}
										onChange={(e) => set("sell_scope", e.target.value as "local" | "global")}
										className={fieldClass}
									>
										<option value="local">Locally</option>
										<option value="global">Worldwide</option>
									</select>
								</FormField>
							</div>
						</Panel>
						<Panel>
							<h2 className="font-semibold">What does your business sell?</h2>
							<p className="mt-1 mb-5 text-xs text-muted-foreground">
								Select all the categories that apply.
							</p>
							{categories.isError ? (
								<p role="alert" className="text-xs text-destructive">
									Couldn’t load categories.{" "}
									<button type="button" onClick={() => categories.refetch()} className="underline">
										Try again
									</button>
								</p>
							) : (
								<>
									<input
										aria-label="Search business categories"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search categories…"
										className={cn(fieldClass, "mb-4")}
									/>
									<div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
										{availableCategories
											.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
											.map((category) => (
												<button
													type="button"
													key={category}
													aria-pressed={values.business_categories.includes(category)}
													onClick={() =>
														set(
															"business_categories",
															values.business_categories.includes(category)
																? values.business_categories.filter((c) => c !== category)
																: [...values.business_categories, category],
														)
													}
													className={cn(
														"inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition focus-visible:outline-primary",
														values.business_categories.includes(category)
															? "bg-primary/10 font-medium text-primary"
															: "text-muted-foreground hover:bg-muted",
													)}
												>
													{values.business_categories.includes(category) && <Check size={12} />}
													{category}
												</button>
											))}
									</div>
									{categories.isPending && (
										<p className="text-xs text-muted-foreground">Loading categories…</p>
									)}
									{!categories.isPending &&
										!availableCategories.filter((c) =>
											c.toLowerCase().includes(search.toLowerCase()),
										).length && (
											<p className="text-xs text-muted-foreground">No categories found.</p>
										)}
								</>
							)}
						</Panel>
						<Panel>
							<h2 className="mb-1 font-semibold">Contact & location</h2>
							<p className="mb-6 text-xs text-muted-foreground">
								The person and address behind your store.
							</p>
							<div className="space-y-5">
								<FormField label="Full name" id="seller-full-name">
									<input
										id="seller-full-name"
										autoComplete="name"
										required
										maxLength={255}
										value={values.full_name}
										onChange={(e) => set("full_name", e.target.value)}
										placeholder="Your full name"
										className={fieldClass}
									/>
								</FormField>
								<FormField label="Phone number" id="seller-phone">
									<input
										id="seller-phone"
										type="tel"
										autoComplete="tel"
										required
										maxLength={20}
										value={values.phone_number}
										onChange={(e) => set("phone_number", e.target.value.replace(/[\s()-]/g, ""))}
										placeholder="+234 801 234 5678"
										className={fieldClass}
									/>
									<p className="mt-2 text-[11px] text-muted-foreground">
										Include your international dialling code, such as +234.
									</p>
								</FormField>
								<FormField label="Store address" id="store-address">
									<textarea
										id="store-address"
										autoComplete="street-address"
										required
										maxLength={255}
										rows={4}
										value={values.store_address}
										onChange={(e) => set("store_address", e.target.value)}
										placeholder="Street address, city, state, and postal code"
										className={cn(fieldClass, "h-auto resize-y py-3 leading-relaxed")}
									/>
								</FormField>
							</div>
						</Panel>
					</div>
					<aside className="space-y-5 xl:sticky xl:top-0">
						<Panel className="bg-primary/5">
							<div className="mb-4 w-fit rounded-xl bg-card p-3 text-primary">
								<Store size={24} />
							</div>
							<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
								Your business
							</p>
							<h2 className="mt-2 break-words text-lg font-semibold">
								{values.business_name || "Your store name"}
							</h2>
							<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
								{countryName(values.country)} ·{" "}
								{values.sell_scope === "global" ? "Worldwide" : "Local selling"}
							</p>
							<div className="mt-4 flex flex-wrap gap-1.5">
								{values.business_categories.map((category) => (
									<span
										key={category}
										className="rounded-full bg-card px-2 py-1 text-[10px] text-primary"
									>
										{category}
									</span>
								))}
							</div>
						</Panel>
						<div className="px-2">
							<ShieldCheck size={21} className="mb-3 text-primary" />
							<h3 className="text-xs font-semibold">Keep your information current</h3>
							<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
								Accurate contact and business details help you manage orders and complete
								verification.
							</p>
						</div>
					</aside>
				</fieldset>
				<div className="mt-6 flex justify-end border-t border-border pt-5">
					<Button
						type="submit"
						disabled={save.isPending || categories.isPending || categories.isError}
						className="rounded-full px-6"
					>
						{save.isPending && <Loader2 size={15} className="animate-spin" />}
						{save.isPending ? "Saving…" : setup ? "Create seller account" : "Save changes"}
					</Button>
				</div>
			</form>
		</>
	)
}

function FormField({ label, id, children }: { label: string; id: string; children: ReactNode }) {
	return (
		<div>
			<label htmlFor={id} className="mb-2 block text-xs font-medium">
				{label}
			</label>
			{children}
		</div>
	)
}

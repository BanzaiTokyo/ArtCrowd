import smartpy as sp

from templates import fa2_lib as fa2
from templates import fa2_lib_testing as testing

main = fa2.main


@sp.module
def tt():
    create_project: type = sp.record(
        project_id=sp.nat,
        share_price=sp.mutez,
    ).layout(("project_id", "share_price"))

    update_project_status: type = sp.record(
        project_id=sp.nat,
        status=sp.string,
    ).layout(("project_id", "status"))

    buy_shares: type = sp.record(
        project_id=sp.nat,
        wallet=sp.address,
        shares=sp.nat,
    ).layout(("project_id", "shares"))

    refund: type = sp.record(
        project_id=sp.nat,
        wallets=list[sp.address],
    ).layout(("project_id", "wallets"))

    withdraw: type = sp.record(
        to_=sp.address,
        amount=sp.mutez,
    ).layout(("to_", "amount"))
    TShareKey: type = sp.pair[sp.nat, sp.address]
    TShares: type = sp.big_map[TShareKey, sp.nat]
    TLedger: type = sp.big_map[sp.address, sp.nat]
    TProject: type = sp.record(
        status=sp.string,
        share_price=sp.mutez,
        total_shares=sp.nat
    ).layout(("status", ("share_price", "total_shares")))
    TRefundAll: type = sp.record(
        project_id=sp.nat,
        wallets=list[sp.address],
    ).layout(("project_id", "wallets"))


@sp.module
def m():
    class ProjectContract(main.Admin, main.WithdrawMutez):
        def __init__(self, admin):
            main.WithdrawMutez.__init__(self)
            main.Admin.__init__(self, admin)
            self.data.fee_pct = sp.nat(103)  # 1 + 3%
            self.data.projects = sp.cast(sp.big_map(), sp.big_map[sp.nat, tt.TProject])
            self.data.shares = sp.cast(sp.big_map(), tt.TShares)
            self.data.ledger = sp.cast(sp.big_map(), tt.TLedger)

        @sp.entrypoint
        def create_project(self, project_id, share_price):
            #sp.cast(params, tt.create_project)
            assert self.is_administrator_(), "FA2_NOT_ADMIN"
            #(project_id, share_price) = params
            assert not self.data.projects.contains(project_id), "project already exists"
            self.data.projects[project_id] = sp.record(
                status='open', max_shares=0, share_price=share_price
            )

        @sp.entrypoint
        def update_project_status(self, project_id, new_status):
            assert self.is_administrator_(), "FA2_NOT_ADMIN"
            #(project_id, status) = params
            assert self.data.projects.contains(project_id), "Project not found."
            project = self.data.projects[project_id]
            project.status = new_status
            self.data.projects[project_id] = project

        @sp.entrypoint
        def add_money(self):
            self.data.ledger[sp.sender] = sp.amount

        @sp.entrypoint
        def refund(self, wallet):
            sp.send(wallet, self.data.ledger[wallet])
            del self.data.ledger[wallet]

        @sp.entrypoint
        def buy_shares(self, project_id, wallet, num_shares):
            project = self.data.projects[project_id]
            project.total_shares = project.total_shares + num_shares
            self.data.projects[project_id] = project
            shares_key = (project_id, wallet)
            self.data.shares[shares_key] = self.data.shares.get(shares_key, default=0) + num_shares
            amount = num_shares * project.share_price
            self.data.ledger[wallet] = self.data.ledger[wallet] - amount

        @sp.entrypoint
        def refund_all(self, project_id, wallets):
            assert self.is_administrator_(), "FA2_NOT_ADMIN"
            #(project_id, wallets) = params
            assert self.data.projects.contains(project_id), "Project not found."
            project = self.data.projects[project_id]
            for wallet in wallets:
                shares_key = (project_id, wallet)
                shares_to_remove = self.data.shares.get(shares_key, default=0)
                if shares_to_remove > 0:
                    del self.data.shares[shares_key]
                    project.total_shares = abs(project.total_shares - shares_to_remove)
                    withdraw_amount_no_fee = sp.split_tokens(project.share_price, shares_to_remove, 1)
                    #withdraw_with_fee = sp.split_tokens(withdraw_amount_no_fee, self.data.fee_pct, 100)
                    sp.send(wallet, withdraw_amount_no_fee)
            self.data.projects[project_id] = project

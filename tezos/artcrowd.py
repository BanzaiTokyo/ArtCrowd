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
    TProject: type = sp.record(
        status=sp.string,
        share_price=sp.mutez,
        total_shares=sp.nat
    ).layout(("status", ("share_price", "total_shares")))
    TRefund: type = sp.record(
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

        @sp.entrypoint
        def create_project(self, project_id, share_price):
            #sp.cast(params, tt.create_project)
            assert self.is_administrator_(), "FA2_NOT_ADMIN"
            #(project_id, share_price) = params
            assert not self.data.projects.contains(project_id), "project already exists"
            self.data.projects[project_id] = sp.record(
                status='new', total_shares=0, share_price=share_price
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
        def buy_shares(self, project_id, num_shares):
            #sp.cast(params, tt.buy_shares)
            #(project_id, num_shares) = params
            assert num_shares > 0, "Shares must be greater than 0."
            assert self.data.projects.contains(project_id), "Project not found."
            project = self.data.projects[project_id]
            assert not sp.set('new', 'rejected', 'expired', 'closed').contains(project.status), "Project is not open for participation"
            nofee_amount = sp.split_tokens(project.share_price, num_shares, 1)
            total_amount = sp.split_tokens(nofee_amount, self.data.fee_pct, 100)
            assert sp.amount == total_amount, "Transaction amount must equal to share price * number of shares"
            shares_key = (project_id, sp.sender)
            project = self.data.projects[project_id]
            self.data.shares[shares_key] = self.data.shares.get(shares_key, default=0) + num_shares
            project.total_shares = project.total_shares + num_shares
            self.data.projects[project_id] = project
            #self.data.projects[project_id] = sp.record(
            #    shares = sp.update_map(sp.sender, sp.Some(current_shares + num_shares), project.shares),
            #    status = project.status,
            #    share_price = project.share_price,
            #    total_shares = project.total_shares + num_shares
            #)

        @sp.entrypoint
        def refund(self, project_id, wallets):
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
                    withdraw_with_fee = sp.split_tokens(withdraw_amount_no_fee, self.data.fee_pct, 100)
                    sp.send(wallet, withdraw_with_fee)
            self.data.projects[project_id] = project


@sp.add_test(name="Fungible", is_default=True)
def test():
    sc = sp.test_scenario([fa2.t, main, tt, m])
    admin = sp.address('tz1NukWgsw89MAb254g8kc5M8J9CmDs2e3Lo')#sp.test_account("tz1NukWgsw89MAb254g8kc5M8J9CmDs2e3Lo").address
    player1 = sp.test_account("player1").address
    player2 = sp.test_account("player2").address
    treasury = sp.test_account("treasury").address
    c1 = m.ProjectContract(admin)
    sc += c1
    project_id = 1
    c1.create_project(sp.record(project_id=project_id, share_price=sp.mutez(100))).run(sender=admin)
    #c1.buy_shares(sp.record(project_id=project_id, num_shares=3)).run(sender=player1, valid=False)
    c1.update_project_status(sp.record(project_id=project_id, new_status='open')).run(sender=admin)
    c1.buy_shares(sp.record(project_id=project_id, num_shares=3)).run(amount=sp.mutez(309), sender=player1)
    sc.verify(c1.data.shares[(1, player1)] == 3)
    c1.buy_shares(sp.record(project_id=project_id, num_shares=5)).run(amount=sp.mutez(515), sender=player2)
    c1.refund(sp.record(project_id=project_id, wallets=[player2])).run(sender=admin)
    c1.withdraw_mutez(sp.record(amount=sp.split_tokens(sp.mutez(309), 1, 1), destination=treasury)).run(sender=admin)
    sc.verify(c1.balance == sp.mutez(0))
    sc.verify(c1.data.shares[(1, player1)] == 3)
    sc.verify(~ c1.data.shares.contains((1, player2)))

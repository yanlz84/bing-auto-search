// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.251
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["雪域高原长治久安", "九三阅兵最后一次夜间演练画面", "这种“大金镯子”千万别买", "期待 10天后一起看阅兵！", "三孩妈叠加补贴 20多万买110平房子", "无锡地铁回应宣传图“不雅画面”", "用信用卡12年才知每年被扣2600元", "为何“老赖”还能坐一等座出行", "美国大巴侧翻 22岁中国留学生遇难", "陆军方队将第一个劈枪走过天安门", "全国首场机器人PK真人烧烤比赛", "西安某公共场所有传染病毒？假", "27岁尿毒症女生：跑一天外卖换一天命", "大桥事故致12死 中国中铁回应", "鲁迅长孙回应同款毛背心爆火", "男子退租留满柜尿瓶 离厕所就10步", "半只鸡卖1999元 上海一餐厅回应", "三亚海边巨浪直逼灯塔塔顶", "《生万物》被指“农村玛丽苏”", "崔鹏自曝曾暗恋董璇4年", "朝鲜士兵发射炮弹摧毁乌军装甲车", "杨宗纬摔下舞台最新画面：头先着地", "多地图书馆成“免费托儿所”", "卢秀燕：我无法参选国民党主席", "女子疑因家暴去世 知情人：丈夫自首", "王曼昱孙颖莎女双走位火了", "成都车展8大豪门集体缺席", "何晟铭回应结婚了吗", "向特朗普女儿求婚后 他如何“捞金”", "鲁迅抽烟墙画被投诉误导青少年", "机器人现场拜师学锦州烧烤绝活", "二手平台出售清华食堂餐具 标价88元", "鹿晗演唱会差点摔下升降台", "伊朗：打死6人 缴获大量美制武器", "无手男子无证开路虎上路", "杨幂发文告别《生万物》和绣绣", "黄杨钿甜中戏报道被偶遇", "何晟铭坦言是来蹭流量的", "公安局副局长赤膊上阵扑倒诈骗分子", "热依扎分享骨折经历：真的不是卖惨", "三大运营商的“钱袋子”也变瘪了", "多地调整最低工资标准 9月1日起执行", "“我们抢个红包为啥被抓了”", "“领导干部带头开短会 讲短话”", "A股4名00后总经理均系继承父业", "于东来回应招聘火爆致系统崩溃", "72岁老人信访遭干部辱骂？当地回应", "俄罗斯国家杜马主席将访华", "贪官纵容儿子单次赌球投入超百万元", "单场打赏千万 团播火热背后一地鸡毛", "胖东来招聘何以成“现象级”事件"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}

// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.230
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
var default_search_words = ["改善生态环境就是发展生产力", "台风“杨柳”带来大暴雨、特大暴雨", "牛弹琴：中国释放了一个强烈信号", "“双贴息”惠及哪些群体？官方解析", "北大教授被举报违规招生 校方通报", "日照一赶海园被曝撒人工饲养蛤蜊", "“变种怪兔”入侵美国一社区", "老人偷买三轮车在家试驾撞烂围墙", "女子伤口似发霉听网友劝连夜就医", "俄媒转发中国铁路智能机器人", "金建希被捕后还没吃过一顿饭", "景区百米蹦极台坍塌？假", "美股收盘：纳指、标普500续创历史新高", "女子被赌徒前夫当儿子面杀害", "“碳水”选对了吃得饱还不长胖", "带4名儿童坐高铁到底需要买几张票", "“吃鸡蛋事件”事发地成谜", "艾滋甲乙丙肝一张身份证可全国追查", "百名袖珍人在“小人国”表演谋生", "市监局介入调查赵露思助农风波", "男生被邻居撞成重伤 一年后不治身亡", "男子眼球被炸破 夏天很多人在用它", "男子转账3500备注彩礼要求返还被驳回", "甘肃男生遭欺辱 被逼跪地爬行学狗叫", "高校收宿舍空调租金4年要1680元", "中国输美蔬菜卖向日本", "“我不是史铁生但网友全是余华”", "赵露思直播称要注销社媒账号", "女子称带两孩子避雨遭保安驱赶", "印度21岁聋哑女子遭绑架性侵", "官方称助农大使称号证书是真的", "外交部亚洲司司长向日方表严重关切", "台风杨柳最新路径：已进入广东梅州", "网红“馆长”回应自己“变化大”", "外媒：普京特朗普获“烧烤诺贝尔奖”", "日本游艇撞上运输船 或已沉没", "遇难男童父亲救援群致谢 满屏节哀", "大理走失男童涉事夏令营机构被调查", "中国籍程序员谋杀被抓？警方：抓错人", "泽连斯基：欧美与俄谈判达成五项共识", "中韩争夺男篮亚洲杯4强前瞻", "无人机违法试飞坠落致铁路中断4小时", "男子恶意拨打110六百多次被判刑", "消息人士：“特普会”将不谈领土划分", "金建希所在看守所每顿餐标约9元", "台风“杨柳”在福建漳浦再次登陆", "曝美国在AI芯片出货时偷装追踪器", "俄乌激战红军城 乌总统收到前线报告", "未拴绳宠物狗追咬马致游客摔伤", "新西兰总理称内塔尼亚胡已失去理智", "向市长递简历大学生考上三支一扶"]

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
